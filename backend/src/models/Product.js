const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required']
    },
    publicId: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    alt: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const productSpecificationsSchema = new mongoose.Schema(
  {
    fabric: { type: String, default: '' },
    fabricComposition: { type: String, default: '' },
    gsm: { type: String, default: '' },
    availableSizes: [{ type: String }],
    colour: [{ type: String }],
    customisation: { type: String, default: '' },
    productType: { type: String, default: '' },
    manufacturingModels: [{ type: String, enum: ['job-work', 'complete-manufacturing', 'both'] }]
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters']
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
      index: true
    },
    images: {
      type: [productImageSchema],
      default: []
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true
    },
    specifications: {
      type: productSpecificationsSchema,
      default: () => ({})
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

// Compound and text indexes for search, filtering, and sorting
productSchema.index({ status: 1, category: 1, sortOrder: 1 });
productSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
