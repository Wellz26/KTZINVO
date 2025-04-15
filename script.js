// ==========================
// Cathy’s Quotes/Invoice - script.js
// ==========================

let items = [];
let isConvertedToZWL = false;
let exchangeRate = 0;
let isInvoice = false;

function addItem() {
  const name = document.getElementById('itemName').value.trim();
  const qty = parseInt(document.getElementById('itemQty').value);
  const price = parseFloat(document.getElementById('itemPrice').value);

  if (!name || qty <= 0 || isNaN(price) || price < 0) {
    alert('Please enter valid item details.');
    return;
  }

  items.push({ name, qty, price });
  updateTable();
  clearInputs();
}

function updateTable() {
  const tbody = document.getElementById('itemList');
  tbody.innerHTML = '';
  let subtotal = 0;

  items.forEach((item, i) => {
    const total = item.qty * item.price;
    subtotal += total;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>${formatCurrency(total)}</td>
      <td>
        <button class="action-btn" onclick="editItem(${i})">Edit</button>
        <button class="action-btn" onclick="removeItem(${i})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('subtotal').textContent = formatCurrency(subtotal);
  document.getElementById('total').textContent = formatCurrency(subtotal);
}

function formatCurrency(value) {
  if (isConvertedToZWL && exchangeRate > 0) {
    return `ZWL $${(value * exchangeRate).toFixed(2)}`;
  }
  return `$${value.toFixed(2)}`;
}

function convertToZWL() {
  const rate = prompt('Enter USD to ZWL exchange rate:');
  if (!isNaN(rate) && rate > 0) {
    exchangeRate = parseFloat(rate);
    isConvertedToZWL = true;
    updateTable();
  }
}

function editItem(index) {
  const item = items[index];
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemQty').value = item.qty;
  document.getElementById('itemPrice').value = item.price;
  removeItem(index);
}

function removeItem(index) {
  items.splice(index, 1);
  updateTable();
}

function clearInputs() {
  document.getElementById('itemName').value = '';
  document.getElementById('itemQty').value = '';
  document.getElementById('itemPrice').value = '';
}

function clearAll() {
  items = [];
  isConvertedToZWL = false;
  exchangeRate = 0;

  document.getElementById('clientName').value = '';
  document.getElementById('invoiceDate').value = '';
  clearInputs();
  updateTable();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getValidUntilDate(startDate) {
  const base = new Date(startDate);
  base.setDate(base.getDate() + 21);
  const yyyy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, '0');
  const dd = String(base.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function generateInvoiceHTML(docNumber, clientName, date, validUntil) {
  let html = `
  <div style="width: 100%; display: flex; justify-content: center; padding: 40px 20px; box-sizing: border-box;">
    <div style="font-family: 'Poppins', sans-serif; color: #2e1544; background: white; padding: 60px; width: 100%; max-width: 800px; box-sizing: border-box; border-radius: 12px;">
      <div style="background: #eae6f8; padding: 30px 35px; border-radius: 12px; margin-bottom: 40px;">
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
          <div style="flex: 1 1 60%;">
            <h2 style="margin: 0 0 8px; font-size: 24px; color: #4b2c76;">KONTROL TEKNIKS ZIMBABWE</h2>
            <h3 style="margin: 0 0 12px; font-size: 16px; color: #7d52c1;">HOME & GARDEN</h3>
            <p style="margin: 0; font-size: 14px;"><strong>Locations:</strong> Zonkizizwe Mall (Bradfield), 96 Cecil Ave (Hillside), Sawanga Mall (Victoria Falls)</p>
          </div>
          <div style="flex: 1 1 35%; text-align: right; font-size: 14px; line-height: 1.8;">
            <p><strong>Email:</strong> cathy.linah@icloud.com</p>
            <p><strong>Phone:</strong> +263 772 600 749</p>
          </div>
        </div>
      </div>
      <div style="margin-bottom: 30px; font-size: 15px;">
        <p><strong>${isInvoice ? 'Invoice' : 'Quotation'} #:</strong> ${docNumber}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Issued To:</strong> ${clientName}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 15px; margin-top: 20px;">
        <thead style="background: #f3f0fa;">
          <tr>
            <th style="padding: 14px; text-align: left;">Qty</th>
            <th style="padding: 14px; text-align: left;">Description</th>
            <th style="padding: 14px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>`;

  let subtotal = 0;
  items.forEach(item => {
    const total = item.qty * item.price;
    subtotal += total;
    html += `
          <tr>
            <td style="padding: 14px;">${item.qty}</td>
            <td style="padding: 14px;">${item.name}</td>
            <td style="padding: 14px; text-align: right;">${formatCurrency(total)}</td>
          </tr>`;
  });

  const finalTotal = formatCurrency(subtotal);

  html += `
        </tbody>
      </table>
      <div style="margin-top: 40px; font-size: 15px;">
        <p><strong>Subtotal:</strong> ${finalTotal}</p>
        <p><strong>Total:</strong> ${finalTotal}</p>
      </div>
      <div style="margin-top: 60px; font-size: 14px;">
        <p>This ${isInvoice ? 'invoice' : 'quotation'} is valid until: <strong>${validUntil}</strong></p>
        <p>Signature: <strong>Linah M</strong></p>
      </div>
    </div>
  </div>`;
  return html;
}

function exportPDF() {
  const clientName = document.getElementById('clientName').value || 'N/A';
  const date = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
  const docPrefix = isInvoice ? 'INV' : 'QT';
  const docNumber = `${docPrefix}-${date.replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;
  const validUntil = getValidUntilDate(date);
  const printArea = document.getElementById('invoicePrintArea');

  printArea.innerHTML = generateInvoiceHTML(docNumber, clientName, date, validUntil);
  printArea.style.visibility = 'visible';
  printArea.style.position = 'static';
  printArea.style.display = 'block';

  setTimeout(() => {
    html2pdf().set({
      margin: 0,
      filename: `${docNumber}.pdf`,
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      enableLinks: false
    }).from(printArea).save().then(() => {
      printArea.innerHTML = '';
      printArea.style.visibility = 'hidden';
      printArea.style.position = 'absolute';
    });
  }, 200);
}

function printInvoice() {
  const clientName = document.getElementById('clientName').value || 'N/A';
  const date = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
  const docPrefix = isInvoice ? 'INV' : 'QT';
  const docNumber = `${docPrefix}-${date.replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;
  const validUntil = getValidUntilDate(date);
  const printArea = document.getElementById('invoicePrintArea');

  printArea.innerHTML = generateInvoiceHTML(docNumber, clientName, date, validUntil);
  printArea.style.visibility = 'visible';
  printArea.style.position = 'absolute';
  printArea.style.top = '0';
  printArea.style.left = '0';
  printArea.style.width = '100%';
  printArea.style.height = 'auto';
  printArea.style.display = 'block';
  printArea.style.zIndex = '9999';
  printArea.style.background = '#fff';

  window.onafterprint = () => {
    printArea.innerHTML = '';
    printArea.style.visibility = 'hidden';
    printArea.style.position = 'absolute';
    printArea.style.display = 'none';
    window.onafterprint = null;
  };

  window.print();
}

// DOM INIT
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addItemBtn').addEventListener('click', addItem);
  document.getElementById('convertZWLBtn').addEventListener('click', convertToZWL);
  document.getElementById('pdfBtn').addEventListener('click', exportPDF);
  document.getElementById('printBtn').addEventListener('click', printInvoice);
  document.getElementById('clearBtn').addEventListener('click', clearAll);

  document.getElementById('docTypeToggle').addEventListener('change', function () {
    isInvoice = this.checked;
    document.getElementById('docTypeLabel').textContent = isInvoice ? 'Invoice' : 'Quotation';
    document.querySelector('h1').textContent = `Cathy’s ${isInvoice ? 'Invoice' : 'Quotes'}`;
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('✅ Service Worker registered:', reg.scope))
      .catch(err => console.error('❌ Service Worker failed:', err));
  }
});

