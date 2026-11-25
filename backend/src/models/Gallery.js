const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Gallery item title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required']
    },
    cloudinaryPublicId: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['factory', 'production', 'products', 'machinery', 'other'],
      default: 'factory',
      index: true
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

gallerySchema.index({ isPublished: 1, category: 1, sortOrder: 1 });

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;
