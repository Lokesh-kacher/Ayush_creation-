# Ayush Creation — Full Stack B2B Web Portal

Official B2B website and enquiry management system for **Ayush Creation**, a premier garment manufacturer based in Mumbai / Navi Mumbai, Maharashtra, specializing in school uniforms, sports uniforms, and institutional wear.

---

## 📁 Project Structure

```
ayush-creation/
├── frontend/                     # Client-side web portal
│   ├── index.html                # Homepage with hero, stats, trust markers & models
│   ├── about.html                # About Ayush Creation, factory, values & FAQ
│   ├── products.html             # Catalog (School Shirts, Trousers, Skirts, etc.)
│   ├── services.html             # Job-work & Complete Manufacturing details
│   ├── gallery.html              # Factory floor & garment photo gallery with filter
│   ├── contact.html              # B2B quotation enquiry form & WhatsApp links
│   ├── styles.css                # Base stylesheet
│   ├── premium-enhancements.css  # Premium gold/navy visual refinements & animations
│   ├── script.js                 # Frontend interactions & API integration
│   └── images/                   # Product & facility imagery, favicon
│
├── backend/                      # Node.js / Express API & server
│   ├── server.js                 # Express server & static asset handler
│   ├── package.json              # Backend dependencies
│   ├── .env                      # Environment config (Port, company info)
│   ├── routes/
│   │   └── api.js                # Endpoints for enquiries, catalog & health
│   ├── controllers/
│   │   └── enquiryController.js  # Enquiry validation & JSON persistence
│   └── data/
│       └── enquiries.json        # Stored B2B enquiries with status
│
├── package.json                  # Root runner script
└── README.md                     # Documentation
```

---

## 🚀 How to Run

### Option 1: Run via Root (Recommended)
From the `ayush-creation` directory:
```bash
# Start full-stack server (serves frontend + API on port 5000)
npm start
```
Or for live auto-reloading during development:
```bash
npm run dev
```

### Option 2: Run directly with Node
```bash
node backend/server.js
```

Then open your browser at:
👉 **http://localhost:5000**

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check and server status |
| `POST` | `/api/enquiries` | Submit new B2B quotation enquiry |
| `POST` | `/api/contact` | Alias for `/api/enquiries` |
| `GET` | `/api/enquiries` | View all submitted enquiries (admin) |
| `GET` | `/api/stats` | View enquiry counts and company meta |
| `GET` | `/api/products` | Get structured catalog categories |

### Sample Payload for `POST /api/enquiries`:
```json
{
  "name": "Ramesh Patil",
  "businessName": "Vidya Mandir School",
  "phone": "9876543210",
  "email": "enquiry@vidyamandir.edu.in",
  "productRequirement": "School Shirts",
  "manufacturingModel": "Complete Manufacturing",
  "quantity": "500 pieces",
  "message": "Need boys and girls uniform shirts for upcoming academic term."
}
```

---

## 🏢 Company Contact
- **Company:** Ayush Creation
- **Location:** Mumbai / Navi Mumbai, Maharashtra, India
- **Phone:** 7524890613
- **Email:** ayushcreation01@gmail.com
- **WhatsApp:** wa.me/917524890613
