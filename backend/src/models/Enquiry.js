const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    note: {
      type: String,
      required: true,
      trim: true
    },
    createdBy: {
      type: String,
      default: 'Admin'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const enquirySchema = new mongoose.Schema(
  {
    enquiryNumber: {
      type: String,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    businessName: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Business / School name cannot exceed 150 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
      default: ''
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9+\s-]{8,16}$/, 'Please enter a valid phone number (minimum 8-10 digits)']
    },
    customerType: {
      type: String,
      enum: ['school', 'retailer', 'wholesaler', 'institution', 'other'],
      default: 'school',
      index: true
    },
    product: {
      type: String,
      required: [true, 'Product requirement is required'],
      trim: true
    },
    quantity: {
      type: String,
      required: [true, 'Approximate quantity is required'],
      trim: true
    },
    manufacturingModel: {
      type: String,
      enum: ['job-work', 'complete-manufacturing', 'not-specified'],
      default: 'complete-manufacturing',
      index: true
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: [
        'new',
        'contacted',
        'qualified',
        'quotation-sent',
        'follow-up',
        'converted',
        'closed'
      ],
      default: 'new',
      index: true
    },
    source: {
      type: String,
      default: 'website'
    },
    notes: {
      type: [noteSchema],
      default: []
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate reference number before saving
enquirySchema.pre('save', function (next) {
  if (!this.enquiryNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(100 + Math.random() * 900);
    this.enquiryNumber = `AC-${timestamp}-${random}`;
  }
  next();
});

// Indexes for searching & sorting
enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ name: 'text', businessName: 'text', product: 'text' });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

module.exports = Enquiry;
