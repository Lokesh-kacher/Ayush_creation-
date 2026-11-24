const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data', 'enquiries.json');

// Ensure data file exists
function initDataFile() {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
  }
}

initDataFile();

function readEnquiries() {
  try {
    initDataFile();
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading enquiries:', err);
    return [];
  }
}

function writeEnquiries(enquiries) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(enquiries, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing enquiries:', err);
    return false;
  }
}

/**
 * Handle new enquiry submission
 */
exports.createEnquiry = (req, res) => {
  const {
    name,
    fullName,
    businessName,
    company,
    phone,
    email,
    productRequirement,
    product,
    manufacturingModel,
    model,
    quantity,
    message
  } = req.body;

  const clientName = (name || fullName || '').trim();
  const clientBusiness = (businessName || company || '').trim();
  const clientPhone = (phone || '').trim();
  const clientEmail = (email || '').trim();
  const clientProduct = (productRequirement || product || 'General Inquiry').trim();
  const clientModel = (manufacturingModel || model || 'Complete Manufacturing').trim();
  const clientQuantity = (quantity || '').toString().trim();
  const clientMessage = (message || '').trim();

  // Basic Validation
  const errors = [];
  if (!clientName) errors.push('Full Name is required.');
  if (!clientPhone) {
    errors.push('Phone number is required.');
  } else if (!/^[0-9+\s-]{8,15}$/.test(clientPhone.replace(/\s+/g, ''))) {
    errors.push('Please enter a valid phone number (minimum 8-10 digits).');
  }

  if (!clientEmail) {
    errors.push('Email address is required.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
    errors.push('Please enter a valid email address.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  const enquiries = readEnquiries();
  const enquiryId = 'AC-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

  const newEnquiry = {
    id: enquiryId,
    createdAt: new Date().toISOString(),
    name: clientName,
    businessName: clientBusiness || 'N/A',
    phone: clientPhone,
    email: clientEmail,
    productRequirement: clientProduct,
    manufacturingModel: clientModel,
    quantity: clientQuantity || 'Not specified',
    message: clientMessage || 'No additional message provided.',
    status: 'NEW',
    ipAddress: req.ip || req.connection.remoteAddress || 'Unknown'
  };

  enquiries.unshift(newEnquiry);
  const saved = writeEnquiries(enquiries);

  if (!saved) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save enquiry. Please contact us directly on WhatsApp or phone.'
    });
  }

  console.log(`[Ayush Creation] New Enquiry received: ${enquiryId} from ${clientName} (${clientPhone})`);

  return res.status(201).json({
    success: true,
    message: 'Thank you for contacting Ayush Creation! Your quotation request has been received. Our team will review your requirements and reach out within 24 hours.',
    enquiryId: enquiryId,
    data: {
      name: clientName,
      product: clientProduct,
      model: clientModel,
      quantity: clientQuantity
    }
  });
};

/**
 * Get all enquiries (Admin/Review)
 */
exports.getAllEnquiries = (req, res) => {
  const enquiries = readEnquiries();
  return res.json({
    success: true,
    count: enquiries.length,
    enquiries
  });
};

/**
 * Get enquiry stats
 */
exports.getStats = (req, res) => {
  const enquiries = readEnquiries();
  return res.json({
    success: true,
    totalEnquiries: enquiries.length,
    recentCount: enquiries.filter(e => {
      const diffHours = (Date.now() - new Date(e.createdAt).getTime()) / (1000 * 60 * 60);
      return diffHours <= 24;
    }).length,
    company: {
      name: process.env.COMPANY_NAME || 'Ayush Creation',
      phone: process.env.COMPANY_PHONE || '7524890613',
      email: process.env.COMPANY_EMAIL || 'ayushcreation01@gmail.com',
      location: process.env.COMPANY_LOCATION || 'Mumbai / Navi Mumbai'
    }
  });
};
