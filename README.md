# 🧾 KTZ Quotes/Invoice – PWA

**KTZ Quotes/Invoice** is a mobile-friendly, offline-capable Progressive Web App (PWA) designed for **Kontrol Tekniks Zimbabwe**. It allows users to generate invoices, quotations, exports, and import documents dynamically with real-time total calculations, PDF export, email functionality, and secure branch login.

---

## 🚀 Features

- 🔐 **Branch Passcode Login** (secured with modal and retry limit)
- 🧾 **Dynamic Invoice, Quotation, Export, Import** document generation
- 📥 **Add Items** with name, quantity, price, and unit selection
- 💰 **Subtotal and Total Calculation** with ZWL conversion
- 🖨️ **Print or Export to PDF** via `html2pdf.js`
- 📧 **Email Invoice** to clients
- 📦 **Offline Support** via `service-worker.js`
- 💡 **PWA Install Prompt** for desktop/mobile
- 📋 **Editable Items** via modal interface
- 🧠 **Smart UI** optimized for mobile with FAB button and touch-friendly inputs
- 📌 **Version Footer** with changelog hover
- 🏦 **Banking Info** section for clients

---

## 🧱 Tech Stack

- **HTML5**, **CSS3 (Poppins, Variables, Responsive Design)**
- **JavaScript** (modular, event-based)
- **PWA (manifest + service worker)**
- **LocalStorage** (branch login)
- `html2pdf.js` for export
- **SHA-256** hashing support (optional security extension)

---

## 📁 Project Structure

```plaintext
├── index.html           # Main interface
├── style.css            # Responsive styling and print media
├── script.js            # Main logic: add/edit items, export, login
├── service-worker.js    # PWA caching & offline support
├── manifest.json        # PWA metadata
├── version.json         # Version tracking + changelog
├── offline.html         # Offline fallback page
├── icon.png             # App icon for devices
