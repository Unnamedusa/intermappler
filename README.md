# 🗺️ InterMappler Ultimate v10.0

Advanced interactive mapping application with full-stack security and Railway deployment support.

## ✨ Features

### Core Features
- 🗺️ **Interactive Map** - Leaflet-based mapping with multiple tile layers
- 📍 **Markers** - Add, edit, and delete custom markers with types
- 🔍 **Search** - Geocoding search powered by Nominatim
- 🛣️ **Routing** - Multi-waypoint route planning with distance/time
- 📏 **Measurement** - Click to measure distances between points
- 🎨 **Drawing Tools** - Draw polygons, polylines, circles, and rectangles

### Advanced Features
- 🔥 **Heatmap** - Visualize marker density
- 🗂️ **Clustering** - Automatic marker clustering for performance
- 🌓 **Dark Mode** - Toggle between light and dark themes
- 📍 **Geolocation** - Find your current location
- 💾 **Export** - Export data in JSON, GeoJSON, and CSV formats
- 📊 **Statistics** - Real-time statistics dashboard
- 🎯 **Layer Control** - Toggle different map layers

### Security Features
- 🔒 **Helmet.js** - Security headers protection
- 🛡️ **CORS** - Configurable CORS policies
- 🚦 **Rate Limiting** - Protection against abuse
- 🧹 **Data Sanitization** - XSS and NoSQL injection prevention
- 🍪 **Secure Cookies** - HTTPOnly and Secure flags
- 📝 **Input Validation** - Express-validator integration
- 🔐 **HPP Protection** - HTTP Parameter Pollution prevention

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. **Clone or extract the project**
```bash
cd intermappler-railway
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

## 🌐 Railway Deployment

### One-Click Deploy

1. **Create a new project on Railway**
2. **Connect your repository**
3. **Set environment variables** (copy from .env.example)
4. **Deploy!**

### Manual Deployment

```bash
# Railway CLI
railway login
railway init
railway up
```

### Environment Variables for Railway

Set these in Railway dashboard:
- `NODE_ENV=production`
- `PORT=3000` (Railway will set this automatically)
- `JWT_SECRET=your-secret-key`
- `ALLOWED_ORIGINS=https://yourdomain.com`

## 📦 Project Structure

```
intermappler-railway/
├── public/              # Static files
│   ├── css/
│   │   └── styles.css  # Main stylesheet
│   ├── js/
│   │   ├── app.js      # Main application logic
│   │   ├── map.js      # Map management
│   │   └── utils.js    # Utility functions
│   └── index.html      # Main HTML file
├── routes/              # API routes
│   └── mapRoutes.js    # Map endpoints
├── middleware/          # Custom middleware (future)
├── config/             # Configuration files (future)
├── server.js           # Express server
├── package.json        # Dependencies
├── .env.example        # Environment variables template
└── README.md           # This file
```

## 🔌 API Endpoints

### Markers

- `GET /api/maps/markers` - Get all markers
- `POST /api/maps/markers` - Create a new marker
- `PUT /api/maps/markers/:id` - Update a marker
- `DELETE /api/maps/markers/:id` - Delete a marker

### Routes

- `GET /api/maps/routes` - Get all saved routes
- `POST /api/maps/routes` - Save a new route

### Export

- `GET /api/maps/export` - Export all data

### Health Check

- `GET /health` - Server health status

## 🛠️ Development

### Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
```

### Adding New Features

1. Create new route files in `routes/`
2. Add middleware in `middleware/`
3. Update UI in `public/`
4. Test thoroughly before deploying

## 🔒 Security Best Practices

1. **Always use HTTPS in production**
2. **Keep dependencies updated**: `npm audit fix`
3. **Use strong JWT secrets**
4. **Configure CORS properly**
5. **Enable rate limiting**
6. **Validate all user inputs**
7. **Sanitize data before storage**

## 🎨 Customization

### Themes

Edit CSS variables in `public/css/styles.css`:

```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  /* ... more variables */
}
```

### Map Configuration

Edit `map.js`:

```javascript
this.config = {
  defaultCenter: [40.416775, -3.703790],
  defaultZoom: 6,
  /* ... more config */
};
```

## 📊 Features Roadmap

### ✅ Completed
- [x] Basic map functionality
- [x] Marker management
- [x] Search and geocoding
- [x] Route planning
- [x] Heatmap visualization
- [x] Marker clustering
- [x] Drawing tools
- [x] Export functionality
- [x] Dark mode
- [x] Geolocation
- [x] Distance measurement
- [x] Full security implementation
- [x] Railway deployment ready

### 🔄 In Progress
- [ ] User authentication
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Real-time collaboration
- [ ] Offline mode (PWA)

### 🎯 Planned
- [ ] Custom marker icons upload
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Print/PDF export
- [ ] Share maps via URL
- [ ] Weather layer integration
- [ ] Traffic data overlay
- [ ] 3D terrain view

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🐛 Bug Reports

If you find a bug, please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 💬 Support

For support, please:
- Check the documentation
- Search existing issues
- Open a new issue if needed

## 🙏 Acknowledgments

- [Leaflet](https://leafletjs.com/) - Interactive maps
- [OpenStreetMap](https://www.openstreetmap.org/) - Map data
- [Railway](https://railway.app/) - Hosting platform
- [Express.js](https://expressjs.com/) - Web framework

---

Made with ❤️ by InterMappler Team

Version: 10.0.0  
Last Updated: February 2026
