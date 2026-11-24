const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for API calls
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Mount API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Serve static frontend files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Fallback: For any GET request not handled by API or static files, serve index.html
app.get('*', (req, res) => {
  // If the path specifically looks like an HTML file request e.g. /about.html, let static handle it
  if (req.path.endsWith('.html') || req.path.endsWith('.css') || req.path.endsWith('.js')) {
    const file = path.join(frontendPath, req.path);
    return res.sendFile(file, (err) => {
      if (err) res.status(404).send('File Not Found');
    });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🏭 Ayush Creation B2B Portal Server Running!`);
  console.log(`🌐 Website URL: http://localhost:${PORT}`);
  console.log(`📡 API URL:     http://localhost:${PORT}/api/health`);
  console.log(`📁 Frontend:    ${frontendPath}`);
  console.log(`💼 Location:    Mumbai / Navi Mumbai, Maharashtra`);
  console.log(`📞 Contact:     7524890613 | ayushcreation01@gmail.com`);
  console.log('====================================================');
});
