const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  }
  next();
};

// In-memory storage (replace with database in production)
let markers = [];
let routes = [];

// Get all markers
router.get('/markers', (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        markers,
        count: markers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Add new marker
router.post('/markers', [
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('type').optional().isIn(['default', 'important', 'warning', 'info']),
  validate
], (req, res) => {
  try {
    const { lat, lng, title, description, type } = req.body;
    
    const newMarker = {
      id: Date.now().toString(),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      title,
      description: description || '',
      type: type || 'default',
      createdAt: new Date().toISOString()
    };
    
    markers.push(newMarker);
    
    res.status(201).json({
      status: 'success',
      data: { marker: newMarker }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Update marker
router.put('/markers/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('type').optional().isIn(['default', 'important', 'warning', 'info']),
  validate
], (req, res) => {
  try {
    const { id } = req.params;
    const markerIndex = markers.findIndex(m => m.id === id);
    
    if (markerIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Marker not found'
      });
    }
    
    markers[markerIndex] = {
      ...markers[markerIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.status(200).json({
      status: 'success',
      data: { marker: markers[markerIndex] }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Delete marker
router.delete('/markers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = markers.length;
    markers = markers.filter(m => m.id !== id);
    
    if (markers.length === initialLength) {
      return res.status(404).json({
        status: 'error',
        message: 'Marker not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Marker deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get routes
router.get('/routes', (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        routes,
        count: routes.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Save route
router.post('/routes', [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Route name is required'),
  body('waypoints').isArray({ min: 2 }).withMessage('At least 2 waypoints required'),
  validate
], (req, res) => {
  try {
    const { name, waypoints, distance, duration } = req.body;
    
    const newRoute = {
      id: Date.now().toString(),
      name,
      waypoints,
      distance: distance || null,
      duration: duration || null,
      createdAt: new Date().toISOString()
    };
    
    routes.push(newRoute);
    
    res.status(201).json({
      status: 'success',
      data: { route: newRoute }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Export data
router.get('/export', (req, res) => {
  try {
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '10.0.0',
      markers,
      routes
    };
    
    res.status(200).json({
      status: 'success',
      data: exportData
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
