let items = [];

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
      <td>$${item.price.toFixed(2)}</td>
      <td>$${total.toFixed(2)}</td>
      <td>
        <button class="action-btn" onclick="editItem(${index})">Edit</button>
        <button class="action-btn" onclick="removeItem(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('subtotal').textContent = subtotal.toFixed(2);
  document.getElementById('total').textContent = subtotal.toFixed(2);
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

  document.getElementById('quoteClientName').textContent = clientName;
  document.getElementById('quoteDate').textContent = date;
  document.getElementById('quoteNumber').textContent = quoteNumber;

  const printList = document.getElementById('printItemList');
  printList.innerHTML = '';
  let subtotal = 0;

  items.forEach((item) => {
    const total = item.qty * item.price;
    subtotal += total;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.qty}</td>
      <td>${item.name}</td>
      <td>$${total.toFixed(2)}</td>
    `;
    printList.appendChild(row);
  });

  document.getElementById('printSubtotal').textContent = subtotal.toFixed(2);
  document.getElementById('printTotal').textContent = subtotal.toFixed(2);

  const invoice = document.getElementById('invoicePrintArea');
  invoice.style.display = 'block';

  html2pdf()
    .from(invoice)
    .set({
      margin: 0.3,
      filename: `${quoteNumber}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    })
    .save()
    .then(() => {
      invoice.style.display = 'none';
    });
}

function printInvoice() {
  window.print();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}
