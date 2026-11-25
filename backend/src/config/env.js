const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayush_creation',

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'ayush_creation_default_dev_access_secret_min32',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'ayush_creation_default_dev_refresh_secret_min32',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  FRONTEND_URLS: (process.env.FRONTEND_URL || 'https://ayush-creation.vercel.app,http://localhost:5000,http://127.0.0.1:5500')
    .split(',')
    .map(url => url.trim().replace(/\/$/, '')),

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  EMAIL_HOST: process.env.EMAIL_HOST || '',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT, 10) || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Ayush Creation <ayushcreation01@gmail.com>',
  EMAIL_TO: process.env.EMAIL_TO || 'ayushcreation01@gmail.com'
};

module.exports = env;
