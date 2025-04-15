// ==========================
// Cathy’s Quotes/Invoice - script.js (Updated with Email Support)
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

function exportPDF() {
  const clientName = document.getElementById('clientName').value || 'N/A';
  const date = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];

  const docPrefix = isInvoice ? 'INV' : 'QT';
  const docNumber = `${docPrefix}-${date.replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;
  const printArea = document.getElementById('invoicePrintArea');

  printArea.style.visibility = 'visible';
  printArea.style.position = 'static';

  let html = `
    <div style="width: 100%; display: flex; justify-content: center;">
      <div style="font-family: 'Poppins', sans-serif; color: #2e1544; background: white; padding: 50px 60px; width: 100%; max-width: 800px; box-sizing: border-box; border-radius: 10px;">
        <div style="background: #eae6f8; padding: 25px 30px; border-radius: 10px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
            <div style="flex: 1 1 60%;">
              <h2 style="margin: 0; font-size: 22px; color: #4b2c76;">KONTROL TEKNIKS ZIMBABWE</h2>
              <h3 style="margin: 6px 0 10px; font-size: 16px; color: #7d52c1;">HOME & GARDEN</h3>
              <p style="margin: 0; font-size: 13px;"><strong>Locations:</strong> Zonkizizwe Mall (Bradfield), 96 Cecil Ave (Hillside), Sawanga Mall (Victoria Falls)</p>
            </div>
            <div style="text-align: right; font-size: 13px;">
              <p style="margin: 0;"><strong>Email:</strong> cathy.linah@icloud.com</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> +263 772 600 749</p>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 25px; font-size: 14px; display: flex; justify-content: space-between;">
          <div>
            <p><strong>${isInvoice ? 'Invoice' : 'Quotation'} #:</strong> ${docNumber}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Issued To:</strong> ${clientName}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 10px;">
          <thead style="background: #f3f0fa;">
            <tr>
              <th style="padding: 12px; text-align: left;">Qty</th>
              <th style="padding: 12px; text-align: left;">Description</th>
              <th style="padding: 12px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>`;

  let subtotal = 0;
  items.forEach(item => {
    const total = item.qty * item.price;
    subtotal += total;
    const formattedTotal = formatCurrency(total);
    html += `
            <tr>
              <td style="padding: 12px;">${item.qty}</td>
              <td style="padding: 12px;">${item.name}</td>
              <td style="padding: 12px; text-align: right;">${formattedTotal}</td>
            </tr>`;
  });

  const finalTotal = formatCurrency(subtotal);

  html += `
          </tbody>
        </table>

        <div style="margin-top: 30px; font-size: 14px;">
          <p><strong>Subtotal:</strong> ${finalTotal}</p>
          <p><strong>Total:</strong> ${finalTotal}</p>
        </div>

        <div style="margin-top: 60px; font-size: 13px;">
          <p>This ${isInvoice ? 'invoice' : 'quotation'} is valid for: ____________________</p>
          <p>Signature: _________________________</p>
        </div>
      </div>
    </div>`;

  printArea.innerHTML = html;

  setTimeout(() => {
    printArea.style.width = '100vw';
    printArea.style.display = 'flex';
    printArea.style.justifyContent = 'center';
    printArea.style.alignItems = 'center';

    html2pdf().set({
      margin: 0,
      filename: `${docNumber}.pdf`,
      html2canvas: {
        scale: 2,
        useCORS: false,
        allowTaint: true,
        scrollY: 0
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    }).from(printArea).save().then(() => {
      printArea.style.visibility = 'hidden';
      printArea.style.position = 'absolute';
    });
  }, 150);
}

function sendEmail() {
  const clientName = document.getElementById('clientName').value || 'Client';
  const date = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];

  let body = `Hello ${clientName},%0D%0A%0D%0A`;
  body += `Please find your ${isInvoice ? 'Invoice' : 'Quotation'} dated ${date} below.%0D%0A%0D%0A`;

  items.forEach(item => {
    body += `• ${item.name} - Qty: ${item.qty}, Price: $${item.price}, Total: $${(item.qty * item.price).toFixed(2)}%0D%0A`;
  });

  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  body += `%0D%0ASubtotal: $${total.toFixed(2)}%0D%0ATotal: $${total.toFixed(2)}%0D%0A%0D%0A`;
  body += `Thank you for choosing Cathy’s Quotes/Invoice.%0D%0A%0D%0ARegards,%0D%0AKontrol Techniks Zimbabwe`;

  const subject = `${isInvoice ? 'Invoice' : 'Quotation'} - ${date}`;
  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;

  window.location.href = mailtoLink;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addItemBtn').addEventListener('click', addItem);
  document.getElementById('convertZWLBtn').addEventListener('click', convertToZWL);
  document.getElementById('pdfBtn').addEventListener('click', exportPDF);
  document.getElementById('emailBtn').addEventListener('click', sendEmail);

  document.getElementById('docTypeToggle').addEventListener('change', function () {
    isInvoice = this.checked;
    document.getElementById('docTypeLabel').textContent = isInvoice ? 'Invoice' : 'Quotation';
    document.querySelector('h1').textContent = `Cathy’s ${isInvoice ? 'Invoice' : 'Quotes'}`;
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  }
});
