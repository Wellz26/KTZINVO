let items = [];
let isConvertedToZWL = false;
let exchangeRate = 0;

function addItem() {
  const name = document.getElementById('itemName').value.trim();
  const qty = parseInt(document.getElementById('itemQty').value);
  const price = parseFloat(document.getElementById('itemPrice').value);

  if (!name || qty <= 0 || price < 0) {
    alert('Please fill all fields with valid data.');
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

  items.forEach((item, index) => {
    const total = item.qty * item.price;
    subtotal += total;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>${formatCurrency(total)}</td>
      <td>
        <button class="action-btn" onclick="editItem(${index})">Edit</button>
        <button class="action-btn" onclick="removeItem(${index})">Delete</button>
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
  const rate = prompt("Enter exchange rate (USD to ZWL):");
  if (rate && !isNaN(rate)) {
    exchangeRate = parseFloat(rate);
    isConvertedToZWL = true;
    updateTable();
  }
}

function removeItem(index) {
  items.splice(index, 1);
  updateTable();
}

function editItem(index) {
  const item = items[index];
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemQty').value = item.qty;
  document.getElementById('itemPrice').value = item.price;
  removeItem(index);
}

function clearInputs() {
  document.getElementById('itemName').value = '';
  document.getElementById('itemQty').value = '';
  document.getElementById('itemPrice').value = '';
}

function exportPDF() {
  const clientName = document.getElementById('clientName').value || 'N/A';
  const date = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
  const quoteNumber = `QT-${date.replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;

  const printArea = document.getElementById('invoicePrintArea');
  let html = `
    <div style="font-family: 'Poppins', sans-serif; padding: 2rem; max-width: 800px; margin: auto;">
      <div style="background: #eae6f8; padding: 15px 20px; border-bottom: 2px solid #4b2c76;">
        <h2 style="margin: 0; color: #4b2c76;">KONTROL TEKNIKS ZIMBABWE</h2>
        <h3 style="margin: 0; color: #7d52c1;">HOME & GARDEN</h3>
        <p><strong>Locations:</strong> Zonkizizwe Mall (Bradfield), 96 Cecil Ave (Hillside), Sawanga Mall (Victoria Falls)</p>
        <p><strong>Email:</strong> cathy.linah@icloud.com | <strong>Phone:</strong> +263 772 600 749</p>
      </div>

      <p style="margin-top: 20px;"><strong>Quotation #:</strong> ${quoteNumber}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Received from:</strong> ${clientName}</p>

      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;" border="1" cellpadding="10">
        <thead style="background: #f3f0fa;">
          <tr>
            <th style="text-align: left;">Qty</th>
            <th style="text-align: left;">Description</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>`;

  let subtotal = 0;
  items.forEach(item => {
    const total = item.qty * item.price;
    subtotal += total;
    const formattedTotal = isConvertedToZWL
      ? `ZWL $${(total * exchangeRate).toFixed(2)}`
      : `$${total.toFixed(2)}`;
    html += `<tr>
      <td>${item.qty}</td>
      <td>${item.name}</td>
      <td style="text-align: right;">${formattedTotal}</td>
    </tr>`;
  });

  const finalTotal = isConvertedToZWL
    ? `ZWL $${(subtotal * exchangeRate).toFixed(2)}`
    : `$${subtotal.toFixed(2)}`;

  html += `</tbody>
      </table>

      <p style="margin-top: 25px; font-size: 16px;"><strong>Subtotal:</strong> ${finalTotal}</p>
      <p style="font-size: 16px;"><strong>Total:</strong> ${finalTotal}</p>

      <p style="margin-top: 40px;">This quotation is valid for: ____________________</p>
      <p>Signature: _________________________</p>
    </div>`;

  printArea.innerHTML = html;
  printArea.style.display = 'block';

  html2pdf().from(printArea).set({
    margin: 0.3,
    filename: `${quoteNumber}.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  }).save().then(() => {
    printArea.style.display = 'none';
  });
}

function printInvoice() {
  window.print();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addItemBtn').addEventListener('click', addItem);
  document.getElementById('convertZWLBtn').addEventListener('click', convertToZWL);
  document.getElementById('pdfBtn').addEventListener('click', exportPDF);
  document.getElementById('printBtn').addEventListener('click', printInvoice);
});
