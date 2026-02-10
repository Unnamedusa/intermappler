// Utility Functions for InterMappler

// Toast Notifications
const Toast = {
  show(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  
  success(message, duration) {
    this.show(message, 'success', duration);
  },
  
  error(message, duration) {
    this.show(message, 'error', duration);
  },
  
  warning(message, duration) {
    this.show(message, 'warning', duration);
  },
  
  info(message, duration) {
    this.show(message, 'info', duration);
  }
};

// Loading Overlay
const Loading = {
  show() {
    document.getElementById('loadingOverlay').style.display = 'flex';
  },
  
  hide() {
    document.getElementById('loadingOverlay').style.display = 'none';
  }
};

// API Client
const API = {
  baseURL: '/api',
  
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  async get(endpoint) {
    return this.request(endpoint);
  },
  
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },
  
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
};

// Local Storage Manager
const Storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage error:', error);
      return defaultValue;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },
  
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage error:', error);
    }
  }
};

// Theme Manager
const Theme = {
  current: 'light',
  
  init() {
    this.current = Storage.get('theme', 'light');
    this.apply();
  },
  
  apply() {
    document.documentElement.setAttribute('data-theme', this.current);
    Storage.set('theme', this.current);
  },
  
  toggle() {
    this.current = this.current === 'light' ? 'dark' : 'light';
    this.apply();
    Toast.success(`${this.current === 'dark' ? '🌙' : '☀️'} ${this.current.charAt(0).toUpperCase() + this.current.slice(1)} mode activated`);
  }
};

// Coordinate Formatter
const CoordFormat = {
  decimal(lat, lng, precision = 4) {
    return {
      lat: parseFloat(lat.toFixed(precision)),
      lng: parseFloat(lng.toFixed(precision))
    };
  },
  
  display(lat, lng, precision = 4) {
    const formatted = this.decimal(lat, lng, precision);
    return `Lat: ${formatted.lat}, Lng: ${formatted.lng}`;
  },
  
  dms(decimal) {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
    
    return `${degrees}° ${minutes}' ${seconds}"`;
  }
};

// Distance Calculator
const Distance = {
  // Haversine formula
  calculate(lat1, lng1, lat2, lng2, unit = 'km') {
    const R = unit === 'km' ? 6371 : 3959; // Earth radius in km or miles
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  },
  
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  },
  
  format(distance, unit = 'km') {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} m`;
    }
    return `${distance.toFixed(2)} ${unit}`;
  }
};

// Export Functions
const Exporter = {
  toJSON(data) {
    const json = JSON.stringify(data, null, 2);
    this.download(json, 'intermappler-data.json', 'application/json');
  },
  
  toGeoJSON(markers) {
    const geojson = {
      type: 'FeatureCollection',
      features: markers.map(marker => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [marker.lng, marker.lat]
        },
        properties: {
          title: marker.title,
          description: marker.description,
          type: marker.type,
          createdAt: marker.createdAt
        }
      }))
    };
    
    const json = JSON.stringify(geojson, null, 2);
    this.download(json, 'intermappler-data.geojson', 'application/geo+json');
  },
  
  toCSV(markers) {
    const headers = ['ID', 'Title', 'Description', 'Latitude', 'Longitude', 'Type', 'Created At'];
    const rows = markers.map(m => [
      m.id,
      `"${m.title}"`,
      `"${m.description || ''}"`,
      m.lat,
      m.lng,
      m.type,
      m.createdAt
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    this.download(csv, 'intermappler-data.csv', 'text/csv');
  },
  
  download(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Toast.success(`Exported ${filename}`);
  }
};

// Debounce Function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Validate Coordinates
function isValidCoordinate(lat, lng) {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// Format Time Duration
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
}

// Get Marker Icon by Type
function getMarkerIconHTML(type) {
  const icons = {
    default: '📍',
    important: '⭐',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type] || icons.default;
}

// Copy to Clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    Toast.success('Copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy:', error);
    Toast.error('Failed to copy to clipboard');
  }
}

// Export utilities
window.Toast = Toast;
window.Loading = Loading;
window.API = API;
window.Storage = Storage;
window.Theme = Theme;
window.CoordFormat = CoordFormat;
window.Distance = Distance;
window.Exporter = Exporter;
window.debounce = debounce;
window.isValidCoordinate = isValidCoordinate;
window.formatDuration = formatDuration;
window.getMarkerIconHTML = getMarkerIconHTML;
window.copyToClipboard = copyToClipboard;
