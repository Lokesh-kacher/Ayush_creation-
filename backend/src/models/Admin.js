const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [60, 'Name cannot exceed 60 characters']
    },
    email: {
      type: String,
      required: [true, 'Admin email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
      index: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false // Excluded by default in queries for security
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    refreshToken: {
      type: String,
      select: false
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

/**
 * Compare password helper method
 */
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Clean JSON output: Never return passwordHash or refreshToken to client
 */
adminSchema.methods.toJSON = function () {
  const adminObj = this.toObject();
  delete adminObj.passwordHash;
  delete adminObj.refreshToken;
  delete adminObj.__v;
  return adminObj;
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
