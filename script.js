// ==========================
// KTZ Quotes/Invoice - script.js
// ==========================

let items = [];
let isConvertedToZWL = false;
let exchangeRate = 0;
let docType = 'Quotation';
let branch = '';

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
  const daysToAdd = isConvertedToZWL ? 2 : 21;
  base.setDate(base.getDate() + daysToAdd);
  const yyyy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, '0');
  const dd = String(base.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function generateInvoiceHTML(docNumber, clientName, date, validUntil) {
  let html = `...`;
  // (Omitted for brevity)
  return html;
}

function exportPDF() {
  const clientName = document.getElementById('clientName').value || 'N/A';
  const date = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
  const docPrefix = docType === 'Invoice' ? 'INV' : docType === 'Quotation' ? 'QT' : docType === 'Export' ? 'EXP' : 'IMP';
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
      enableLinks: false,
      pagebreak: { avoid: ['tr', 'table'] }
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
  const docPrefix = docType === 'Invoice' ? 'INV' : docType === 'Quotation' ? 'QT' : docType === 'Export' ? 'EXP' : 'IMP';
  const docNumber = `${docPrefix}-${date.replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;
  const validUntil = getValidUntilDate(date);
  const printArea = document.getElementById('invoicePrintArea');
  printArea.innerHTML = generateInvoiceHTML(docNumber, clientName, date, validUntil);
  printArea.style.visibility = 'visible';
  printArea.style.position = 'absolute';
  printArea.style.top = '0';
  printArea.style.left = '0';
  printArea.style.width = '100%';
  printArea.style.minHeight = '100vh';
  printArea.style.height = 'auto';
  printArea.style.display = 'block';
  printArea.style.zIndex = '9999';
  printArea.style.background = '#fff';
  printArea.style.pageBreakInside = 'avoid';
  window.onafterprint = () => {
    printArea.innerHTML = '';
    printArea.style.visibility = 'hidden';
    printArea.style.position = 'absolute';
    printArea.style.display = 'none';
    window.onafterprint = null;
  };
  window.print();
}

document.addEventListener('DOMContentLoaded', () => {
  const validBranches = {
    '0001': 'Hillside',
    '0002': 'Zonikizizwe',
    '0003': 'Vic Falls'
  };

  if (!localStorage.getItem('ktz_branch')) {
    let branchCode = prompt('Enter Branch Code (0001=Hillside, 0002=Zonikizizwe, 0003=Vic Falls)');
    if (validBranches[branchCode]) {
      const confirmMsg = `You selected: ${validBranches[branchCode]}. Continue?`;
      if (confirm(confirmMsg)) {
        branch = validBranches[branchCode];
        localStorage.setItem('ktz_branch', branch);
      } else {
        location.reload();
      }
    } else {
      alert('Invalid Branch Code. Try again.');
      location.reload();
    }
  } else {
    branch = localStorage.getItem('ktz_branch');
  }

  document.getElementById('addItemBtn').addEventListener('click', addItem);
  document.getElementById('convertZWLBtn').addEventListener('click', convertToZWL);
  document.getElementById('pdfBtn').addEventListener('click', exportPDF);
  document.getElementById('printBtn').addEventListener('click', printInvoice);
  document.getElementById('clearBtn').addEventListener('click', clearAll);
  document.getElementById('docTypeSelect').addEventListener('change', function () {
    docType = this.value;
    document.querySelector('h1').textContent = `Cathy’s ${docType}`;
  });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('✅ Service Worker registered:', reg.scope))
      .catch(err => console.error('❌ Service Worker failed:', err));
  }
});

