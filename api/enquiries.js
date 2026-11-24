module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      service: 'Ayush Creation Enquiries API',
      status: 'Active'
    });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const clientName = (body.name || body.fullName || '').trim();
    const clientBusiness = (body.businessName || body.business || '').trim();
    const clientPhone = (body.phone || '').trim();
    const clientEmail = (body.email || '').trim();
    const clientProduct = (body.productRequirement || body.product || 'General Inquiry').trim();
    const clientModel = (body.manufacturingModel || body.model || 'Complete Manufacturing').trim();
    const clientQuantity = (body.quantity || 'Not specified').toString().trim();
    const clientMessage = (body.message || '').trim();

    if (!clientName) {
      return res.status(400).json({ success: false, message: 'Your name is required.' });
    }
    if (!clientPhone || clientPhone.length < 8) {
      return res.status(400).json({ success: false, message: 'A valid phone number is required.' });
    }

    const enquiryId = 'AC-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

    return res.status(201).json({
      success: true,
      message: 'Thank you for contacting Ayush Creation! Your quotation request has been received. Our team will review your requirements and reach out within 24 hours.',
      enquiryId: enquiryId,
      data: {
        id: enquiryId,
        name: clientName,
        businessName: clientBusiness,
        phone: clientPhone,
        email: clientEmail,
        product: clientProduct,
        model: clientModel,
        quantity: clientQuantity,
        message: clientMessage
      }
    });
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
};
