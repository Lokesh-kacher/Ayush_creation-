const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
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

categorySchema.index({ sortOrder: 1, name: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
