// Main Application Script for InterMappler

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  Theme.init();
  
  // Initialize map
  mapManager.init();
  
  // Setup UI event listeners
  setupEventListeners();
  
  console.log('🗺️ InterMappler Ultimate v10.0 - Ready!');
});

function setupEventListeners() {
  // Sidebar toggle
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
  
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', () => {
    Theme.toggle();
  });
  
  // Search functionality
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchResults = document.getElementById('searchResults');
  
  searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (!query) {
      Toast.warning('Please enter a search query');
      return;
    }
    
    const results = await mapManager.searchLocation(query);
    displaySearchResults(results);
  });
  
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
  
  function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
      searchResults.innerHTML = '<p style="padding: 1rem; text-align: center; color: var(--text-secondary);">No results found</p>';
      return;
    }
    
    results.forEach(result => {
      const div = document.createElement('div');
      div.className = 'search-result-item';
      div.innerHTML = `
        <strong>${result.display_name.split(',')[0]}</strong><br>
        <small>${result.display_name}</small>
      `;
      
      div.addEventListener('click', () => {
        mapManager.flyTo(result.lat, result.lon);
        searchResults.innerHTML = '';
        searchInput.value = '';
        Toast.success('Location found!');
      });
      
      searchResults.appendChild(div);
    });
  }
  
  // Marker form
  const markerForm = document.getElementById('markerForm');
  const markerTitle = document.getElementById('markerTitle');
  const markerDesc = document.getElementById('markerDesc');
  const markerType = document.getElementById('markerType');
  
  markerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!mapManager.clickedLatLng) {
      Toast.warning('Please click on the map first to select a location');
      return;
    }
    
    const title = markerTitle.value.trim();
    if (!title) {
      Toast.warning('Please enter a title');
      return;
    }
    
    const markerData = {
      id: Date.now().toString(),
      lat: mapManager.clickedLatLng.lat,
      lng: mapManager.clickedLatLng.lng,
      title: title,
      description: markerDesc.value.trim(),
      type: markerType.value,
      createdAt: new Date().toISOString()
    };
    
    await mapManager.addMarker(markerData);
    
    // Reset form
    markerForm.reset();
    Toast.success('Marker added successfully!');
  });
  
  // Layer toggles
  const clusteringToggle = document.getElementById('clusteringToggle');
  const heatmapToggle = document.getElementById('heatmapToggle');
  const drawToggle = document.getElementById('drawToggle');
  
  clusteringToggle.addEventListener('change', (e) => {
    mapManager.toggleClustering(e.target.checked);
    Toast.info(`Clustering ${e.target.checked ? 'enabled' : 'disabled'}`);
  });
  
  heatmapToggle.addEventListener('change', (e) => {
    mapManager.toggleHeatmap(e.target.checked);
    Toast.info(`Heatmap ${e.target.checked ? 'enabled' : 'disabled'}`);
  });
  
  drawToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      mapManager.toggleDrawing(true);
      Toast.info('Drawing tools enabled');
    }
  });
  
  // Routing controls
  const startRouting = document.getElementById('startRouting');
  const clearRoute = document.getElementById('clearRoute');
  
  startRouting.addEventListener('click', () => {
    mapManager.startRouting();
    startRouting.style.display = 'none';
    clearRoute.style.display = 'block';
  });
  
  clearRoute.addEventListener('click', () => {
    mapManager.clearRoute();
    startRouting.style.display = 'block';
    clearRoute.style.display = 'none';
  });
  
  // Export buttons
  const exportJSON = document.getElementById('exportJSON');
  const exportGeoJSON = document.getElementById('exportGeoJSON');
  const exportCSV = document.getElementById('exportCSV');
  
  exportJSON.addEventListener('click', () => {
    mapManager.exportData('json');
  });
  
  exportGeoJSON.addEventListener('click', () => {
    mapManager.exportData('geojson');
  });
  
  exportCSV.addEventListener('click', () => {
    mapManager.exportData('csv');
  });
  
  // Map controls
  const locateMe = document.getElementById('locateMe');
  const fullscreen = document.getElementById('fullscreen');
  const measureToggle = document.getElementById('measureToggle');
  
  locateMe.addEventListener('click', () => {
    mapManager.locateUser();
  });
  
  fullscreen.addEventListener('click', () => {
    mapManager.toggleFullscreen();
  });
  
  measureToggle.addEventListener('click', () => {
    Toast.info('Click on the map to measure distances');
    enableMeasurement();
  });
}

// Measurement functionality
function enableMeasurement() {
  let points = [];
  let polyline = null;
  let markers = [];
  
  const measureHandler = (e) => {
    points.push(e.latlng);
    
    // Add marker
    const marker = L.marker(e.latlng, {
      icon: L.divIcon({
        html: `<div style="font-size: 20px;">📍</div>`,
        className: 'measure-marker',
        iconSize: [24, 24]
      })
    }).addTo(mapManager.map);
    
    markers.push(marker);
    
    if (points.length > 1) {
      // Calculate distance
      const lastPoint = points[points.length - 2];
      const currentPoint = points[points.length - 1];
      const distance = Distance.calculate(
        lastPoint.lat,
        lastPoint.lng,
        currentPoint.lat,
        currentPoint.lng
      );
      
      // Update or create polyline
      if (polyline) {
        mapManager.map.removeLayer(polyline);
      }
      
      polyline = L.polyline(points, {
        color: '#2563eb',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 5'
      }).addTo(mapManager.map);
      
      // Calculate total distance
      let totalDistance = 0;
      for (let i = 1; i < points.length; i++) {
        totalDistance += Distance.calculate(
          points[i - 1].lat,
          points[i - 1].lng,
          points[i].lat,
          points[i].lng
        );
      }
      
      Toast.info(`Total distance: ${Distance.format(totalDistance)}`);
    }
  };
  
  mapManager.map.on('click', measureHandler);
  
  // Double click to finish
  mapManager.map.once('dblclick', () => {
    mapManager.map.off('click', measureHandler);
    
    // Clear after 5 seconds
    setTimeout(() => {
      if (polyline) mapManager.map.removeLayer(polyline);
      markers.forEach(m => mapManager.map.removeLayer(m));
      points = [];
      Toast.info('Measurement cleared');
    }, 5000);
  });
}

// Handle beforeunload
window.addEventListener('beforeunload', (e) => {
  // Auto-save could be implemented here
  const hasUnsavedWork = mapManager.markers.length > 0;
  
  if (hasUnsavedWork) {
    // Modern browsers ignore custom messages
    e.preventDefault();
    e.returnValue = '';
  }
});

// Service Worker Registration (for PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment when you have a service worker file
    // navigator.serviceWorker.register('/sw.js')
    //   .then(reg => console.log('Service Worker registered'))
    //   .catch(err => console.log('Service Worker registration failed'));
  });
}

// Error handling
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
  Toast.error('An error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  Toast.error('An error occurred. Please try again.');
});
