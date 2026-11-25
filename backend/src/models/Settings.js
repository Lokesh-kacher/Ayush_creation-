const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'Ayush Creation',
      trim: true
    },
    tagline: {
      type: String,
      default: 'Garment Manufacturers',
      trim: true
    },
    description: {
      type: String,
      default:
        'Quality-focused garment manufacturing and school uniform solutions for schools, retailers and institutional buyers based in Mumbai / Navi Mumbai, Maharashtra.'
    },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }
    },
    phone: {
      type: String,
      default: '7524890613',
      trim: true
    },
    whatsapp: {
      type: String,
      default: '917524890613',
      trim: true
    },
    email: {
      type: String,
      default: 'ayushcreation01@gmail.com',
      trim: true
    },
    address: {
      type: String,
      default: 'Mumbai / Navi Mumbai, Maharashtra, India',
      trim: true
    },
    city: {
      type: String,
      default: 'Mumbai / Navi Mumbai',
      trim: true
    },
    state: {
      type: String,
      default: 'Maharashtra',
      trim: true
    },
    pincode: {
      type: String,
      default: '',
      trim: true
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      facebook: { type: String, default: '' },
      youtube: { type: String, default: '' }
    },
    businessHours: {
      type: String,
      default: 'Mon - Sat: 9:00 AM - 7:00 PM (Sunday Closed)'
    },
    seoTitle: {
      type: String,
      default:
        'Ayush Creation — Garment Manufacturer in Mumbai | School Uniforms & Institutional Wear'
    },
    seoDescription: {
      type: String,
      default:
        'Ayush Creation is a trusted garment manufacturer in Mumbai / Navi Mumbai, specialising in school uniforms, sports uniforms and B2B manufacturing.'
    }
  },
  {
    timestamps: true
  }
);

/**
 * Singleton Helper: Get or create the unique settings document
 */
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
