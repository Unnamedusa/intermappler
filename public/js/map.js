// Map Manager for InterMappler

class MapManager {
  constructor() {
    this.map = null;
    this.markers = [];
    this.markerClusterGroup = null;
    this.heatmapLayer = null;
    this.drawLayer = null;
    this.routingControl = null;
    this.measureControl = null;
    this.clickedLatLng = null;
    this.userLocation = null;
    
    this.config = {
      defaultCenter: [40.416775, -3.703790], // Madrid
      defaultZoom: 6,
      minZoom: 2,
      maxZoom: 18
    };
  }
  
  // Initialize map
  init() {
    // Create map
    this.map = L.map('map', {
      center: this.config.defaultCenter,
      zoom: this.config.defaultZoom,
      minZoom: this.config.minZoom,
      maxZoom: this.config.maxZoom,
      zoomControl: true
    });
    
    // Add tile layers
    this.addBaseLayers();
    
    // Initialize marker clustering
    this.markerClusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50
    });
    this.map.addLayer(this.markerClusterGroup);
    
    // Initialize draw layer
    this.drawLayer = new L.FeatureGroup();
    this.map.addLayer(this.drawLayer);
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Load saved markers
    this.loadMarkers();
    
    Toast.success('Map initialized successfully!');
  }
  
  // Add base layers
  addBaseLayers() {
    const layers = {
      'Street': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }),
      'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19
      }),
      'Terrain': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap',
        maxZoom: 17
      })
    };
    
    layers['Street'].addTo(this.map);
    L.control.layers(layers).addTo(this.map);
  }
  
  // Setup event listeners
  setupEventListeners() {
    // Map click
    this.map.on('click', (e) => {
      this.clickedLatLng = e.latlng;
      this.updateCoordinatesDisplay(e.latlng.lat, e.latlng.lng);
    });
    
    // Map move
    this.map.on('mousemove', (e) => {
      this.updateCoordinatesDisplay(e.latlng.lat, e.latlng.lng);
    });
    
    // Map zoom
    this.map.on('zoomend', () => {
      const zoom = this.map.getZoom();
      Storage.set('lastZoom', zoom);
    });
    
    // Map move end
    this.map.on('moveend', () => {
      const center = this.map.getCenter();
      Storage.set('lastCenter', [center.lat, center.lng]);
    });
  }
  
  // Update coordinates display
  updateCoordinatesDisplay(lat, lng) {
    const display = document.getElementById('coordsDisplay');
    if (display) {
      display.textContent = CoordFormat.display(lat, lng);
    }
  }
  
  // Add marker
  async addMarker(data) {
    const { lat, lng, title, description, type } = data;
    
    if (!isValidCoordinate(lat, lng)) {
      Toast.error('Invalid coordinates');
      return null;
    }
    
    // Create custom icon
    const iconHTML = getMarkerIconHTML(type);
    const icon = L.divIcon({
      html: `<div style="font-size: 24px;">${iconHTML}</div>`,
      className: 'custom-marker-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
    
    // Create marker
    const marker = L.marker([lat, lng], { icon });
    
    // Create popup content
    const popupContent = `
      <div class="marker-popup">
        <h4>${title}</h4>
        ${description ? `<p>${description}</p>` : ''}
        <div class="popup-actions">
          <small>${CoordFormat.display(lat, lng)}</small><br>
          <button onclick="mapManager.removeMarker('${data.id}')" class="btn-sm btn-danger">Delete</button>
          <button onclick="mapManager.copyCoordinates(${lat}, ${lng})" class="btn-sm">Copy Coords</button>
        </div>
      </div>
    `;
    
    marker.bindPopup(popupContent);
    
    // Add to cluster group
    this.markerClusterGroup.addLayer(marker);
    
    // Store marker reference
    this.markers.push({
      ...data,
      markerObj: marker
    });
    
    // Update heatmap if enabled
    if (this.heatmapLayer) {
      this.updateHeatmap();
    }
    
    // Save to API
    try {
      await API.post('/maps/markers', data);
    } catch (error) {
      console.error('Failed to save marker:', error);
    }
    
    this.updateStats();
    return marker;
  }
  
  // Remove marker
  async removeMarker(id) {
    const index = this.markers.findIndex(m => m.id === id);
    if (index !== -1) {
      const marker = this.markers[index];
      this.markerClusterGroup.removeLayer(marker.markerObj);
      this.markers.splice(index, 1);
      
      // Delete from API
      try {
        await API.delete(`/maps/markers/${id}`);
        Toast.success('Marker deleted');
      } catch (error) {
        console.error('Failed to delete marker:', error);
        Toast.error('Failed to delete marker');
      }
      
      this.updateStats();
      
      if (this.heatmapLayer) {
        this.updateHeatmap();
      }
    }
  }
  
  // Load markers from API
  async loadMarkers() {
    try {
      Loading.show();
      const response = await API.get('/maps/markers');
      
      if (response.data && response.data.markers) {
        for (const markerData of response.data.markers) {
          await this.addMarker(markerData);
        }
      }
      
      Loading.hide();
    } catch (error) {
      console.error('Failed to load markers:', error);
      Loading.hide();
    }
  }
  
  // Toggle clustering
  toggleClustering(enabled) {
    if (enabled) {
      this.markerClusterGroup.addTo(this.map);
    } else {
      this.map.removeLayer(this.markerClusterGroup);
      // Add markers directly to map
      this.markers.forEach(m => m.markerObj.addTo(this.map));
    }
  }
  
  // Toggle heatmap
  toggleHeatmap(enabled) {
    if (enabled) {
      const points = this.markers.map(m => [m.lat, m.lng, 1]);
      this.heatmapLayer = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17
      });
      this.heatmapLayer.addTo(this.map);
    } else {
      if (this.heatmapLayer) {
        this.map.removeLayer(this.heatmapLayer);
        this.heatmapLayer = null;
      }
    }
  }
  
  // Update heatmap
  updateHeatmap() {
    if (this.heatmapLayer) {
      this.map.removeLayer(this.heatmapLayer);
      const points = this.markers.map(m => [m.lat, m.lng, 1]);
      this.heatmapLayer = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17
      });
      this.heatmapLayer.addTo(this.map);
    }
  }
  
  // Toggle drawing tools
  toggleDrawing(enabled) {
    if (enabled) {
      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: this.drawLayer
        },
        draw: {
          polygon: true,
          polyline: true,
          rectangle: true,
          circle: true,
          marker: false,
          circlemarker: false
        }
      });
      this.map.addControl(drawControl);
      
      this.map.on('draw:created', (e) => {
        this.drawLayer.addLayer(e.layer);
        this.updateStats();
        Toast.success('Shape added');
      });
      
      this.map.on('draw:deleted', () => {
        this.updateStats();
        Toast.info('Shape deleted');
      });
    }
  }
  
  // Start routing
  startRouting() {
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
    }
    
    this.routingControl = L.Routing.control({
      waypoints: [],
      routeWhileDragging: true,
      showAlternatives: true,
      fitSelectedRoutes: true,
      createMarker: function(i, waypoint, n) {
        const marker = L.marker(waypoint.latLng, {
          draggable: true,
          icon: L.divIcon({
            html: `<div style="font-size: 24px;">${i === 0 ? '🟢' : i === n - 1 ? '🔴' : '⚪'}</div>`,
            className: 'route-marker',
            iconSize: [30, 30]
          })
        });
        return marker;
      }
    }).addTo(this.map);
    
    this.routingControl.on('routesfound', (e) => {
      const route = e.routes[0];
      const distance = (route.summary.totalDistance / 1000).toFixed(2);
      const duration = formatDuration(route.summary.totalTime);
      
      document.getElementById('routeInfo').innerHTML = `
        <p><strong>Distance:</strong> ${distance} km</p>
        <p><strong>Duration:</strong> ${duration}</p>
      `;
      
      Toast.success('Route calculated!');
    });
    
    // Allow adding waypoints by clicking
    this.map.on('click', (e) => {
      if (this.routingControl) {
        const waypoints = this.routingControl.getWaypoints();
        waypoints.push(L.latLng(e.latlng.lat, e.latlng.lng));
        this.routingControl.setWaypoints(waypoints);
      }
    });
    
    Toast.info('Click on map to add waypoints');
  }
  
  // Clear route
  clearRoute() {
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
      document.getElementById('routeInfo').innerHTML = '';
      Toast.info('Route cleared');
    }
  }
  
  // Locate user
  locateUser() {
    Loading.show();
    
    this.map.locate({ setView: true, maxZoom: 16 });
    
    this.map.on('locationfound', (e) => {
      Loading.hide();
      this.userLocation = e.latlng;
      
      L.circle(e.latlng, {
        radius: e.accuracy / 2,
        color: '#2563eb',
        fillColor: '#2563eb',
        fillOpacity: 0.2
      }).addTo(this.map);
      
      L.marker(e.latlng, {
        icon: L.divIcon({
          html: '<div style="font-size: 24px;">📍</div>',
          className: 'user-location-marker',
          iconSize: [30, 30]
        })
      }).addTo(this.map)
        .bindPopup('You are here!')
        .openPopup();
      
      Toast.success('Location found!');
    });
    
    this.map.on('locationerror', (e) => {
      Loading.hide();
      Toast.error('Location access denied');
    });
  }
  
  // Search location
  async searchLocation(query) {
    if (!query) return;
    
    try {
      Loading.show();
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const results = await response.json();
      Loading.hide();
      
      return results;
    } catch (error) {
      console.error('Search error:', error);
      Loading.hide();
      Toast.error('Search failed');
      return [];
    }
  }
  
  // Fly to location
  flyTo(lat, lng, zoom = 14) {
    this.map.flyTo([lat, lng], zoom, {
      duration: 1.5
    });
  }
  
  // Toggle fullscreen
  toggleFullscreen() {
    const mapElement = document.getElementById('map');
    
    if (!document.fullscreenElement) {
      mapElement.requestFullscreen().catch(err => {
        Toast.error('Fullscreen not supported');
      });
    } else {
      document.exitFullscreen();
    }
  }
  
  // Copy coordinates
  copyCoordinates(lat, lng) {
    copyToClipboard(`${lat}, ${lng}`);
  }
  
  // Update statistics
  updateStats() {
    document.getElementById('markerCount').textContent = this.markers.length;
    document.getElementById('drawingCount').textContent = this.drawLayer.getLayers().length;
  }
  
  // Export all data
  exportData(format) {
    const data = {
      markers: this.markers.map(m => ({
        id: m.id,
        lat: m.lat,
        lng: m.lng,
        title: m.title,
        description: m.description,
        type: m.type,
        createdAt: m.createdAt
      })),
      drawings: this.drawLayer.toGeoJSON(),
      center: this.map.getCenter(),
      zoom: this.map.getZoom()
    };
    
    switch (format) {
      case 'json':
        Exporter.toJSON(data);
        break;
      case 'geojson':
        Exporter.toGeoJSON(data.markers);
        break;
      case 'csv':
        Exporter.toCSV(data.markers);
        break;
    }
  }
}

// Initialize map manager globally
window.mapManager = new MapManager();
