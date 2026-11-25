const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

// Initialize transporter only if credentials exist
if (env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD
    }
  });
}

/**
 * Send email notification for new quotation enquiry
 * Safe: never throws error to caller
 */
const sendEnquiryAlert = async (enquiry) => {
  if (!transporter) {
    if (env.NODE_ENV === 'development') {
      console.log('ℹ️  Email alert skipped (EMAIL credentials not configured in backend/.env)');
    }
    return false;
  }

  const mailOptions = {
    from: env.EMAIL_FROM,
    to: env.EMAIL_TO,
    subject: `📢 New B2B Enquiry [${enquiry.enquiryNumber}] from ${enquiry.name} (${enquiry.businessName || 'Direct'})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0A1628; color: #FFFFFF; padding: 20px; text-align: center;">
          <h2 style="color: #F0C060; margin: 0;">AYUSH CREATION</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px;">New Quotation Enquiry Received</p>
        </div>
        <div style="padding: 24px; background-color: #FFFFFF; color: #141C2E;">
          <p><strong>Enquiry Reference:</strong> ${enquiry.enquiryNumber}</p>
          <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 16px 0;" />
          <p><strong>Contact Person:</strong> ${enquiry.name}</p>
          <p><strong>Business / School:</strong> ${enquiry.businessName || 'N/A'}</p>
          <p><strong>Phone:</strong> <a href="tel:${enquiry.phone}">${enquiry.phone}</a> | <a href="https://wa.me/${enquiry.phone.replace(/[^0-9]/g, '')}">WhatsApp Chat</a></p>
          <p><strong>Email:</strong> ${enquiry.email ? `<a href="mailto:${enquiry.email}">${enquiry.email}</a>` : 'Not provided'}</p>
          <p><strong>Customer Type:</strong> ${enquiry.customerType.toUpperCase()}</p>
          <p><strong>Product Required:</strong> ${enquiry.product}</p>
          <p><strong>Quantity:</strong> ${enquiry.quantity}</p>
          <p><strong>Manufacturing Model:</strong> ${enquiry.manufacturingModel}</p>
          <p><strong>Client Message:</strong><br /><em>${enquiry.message || 'No additional message provided.'}</em></p>
        </div>
        <div style="background-color: #F7F9FC; padding: 12px; text-align: center; font-size: 12px; color: #718096;">
          Ayush Creation B2B Portal &copy; ${new Date().getFullYear()} — Mumbai / Navi Mumbai
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Enquiry email alert sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.warn('⚠️ Could not send enquiry email alert:', error.message);
    return false;
  }
};

module.exports = {
  sendEnquiryAlert
};
