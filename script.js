// ==========================
// KTZ Quotes/Invoice - script.js
// ==========================

let items = [];
let isConvertedToZWL = false;
let exchangeRate = 0;
let docType = 'Quotation';

const units = ['pcs', 'kg', 'box', 'set', 'pair', 'm', 'l'];

function addItem() {
  const name = document.getElementById('itemName').value.trim();
  const qty = parseFloat(document.getElementById('itemQty').value);
  const price = parseFloat(document.getElementById('itemPrice').value);
  const unit = document.getElementById('itemUnit').value;

  if (!name || qty <= 0 || isNaN(price) || price < 0) {
    alert('Please enter valid item details.');
    return;
  }

  items.push({ name, qty, price, unit });
  updateTable();
  clearInputs();
  
  // Scroll to the new item
  const table = document.querySelector('.invoice-table');
  table.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
      <td>
        <span class="item-name" onclick="editItemName(${i})">${item.name}</span>
      </td>
      <td>
        <span class="item-qty" onclick="editItemQty(${i})">${item.qty} ${item.unit}</span>
      </td>
      <td>
        <span class="item-price" onclick="editItemPrice(${i})">${formatCurrency(item.price)}</span>
      </td>
      <td>${formatCurrency(total)}</td>
      <td>
        <button class="action-btn" onclick="openEditModal(${i})">Edit</button>
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

function editItemName(index) {
  const item = items[index];
  const cell = document.querySelector(`tr:nth-child(${index + 1}) .item-name`);
  const currentName = cell.textContent;
  
  cell.innerHTML = `<input type="text" value="${currentName}" 
    onblur="updateItemName(${index}, this.value)"
    onkeydown="if(event.key === 'Enter') this.blur()">`;
  cell.querySelector('input').focus();
}

function editItemQty(index) {
  const item = items[index];
  const cell = document.querySelector(`tr:nth-child(${index + 1}) .item-qty`);
  const currentQty = item.qty;
  
  cell.innerHTML = `<input type="number" value="${currentQty}" min="0.01" step="0.01"
    onblur="updateItemQty(${index}, this.value)"
    onkeydown="if(event.key === 'Enter') this.blur()">`;
  cell.querySelector('input').focus();
}

function editItemPrice(index) {
  const item = items[index];
  const cell = document.querySelector(`tr:nth-child(${index + 1}) .item-price`);
  const currentPrice = item.price;
  
  cell.innerHTML = `<input type="number" value="${currentPrice}" min="0" step="0.01"
    onblur="updateItemPrice(${index}, this.value)"
    onkeydown="if(event.key === 'Enter') this.blur()">`;
  cell.querySelector('input').focus();
}

function updateItemName(index, newName) {
  if (newName.trim()) {
    items[index].name = newName.trim();
    updateTable();
  }
}

function updateItemQty(index, newQty) {
  const qty = parseFloat(newQty);
  if (!isNaN(qty) && qty > 0) {
    items[index].qty = qty;
    updateTable();
  }
}

function updateItemPrice(index, newPrice) {
  const price = parseFloat(newPrice);
  if (!isNaN(price) && price >= 0) {
    items[index].price = price;
    updateTable();
  }
}

function removeItem(index) {
  items.splice(index, 1);
  updateTable();
}

function clearInputs() {
  document.getElementById('itemName').value = '';
  document.getElementById('itemQty').value = '';
  document.getElementById('itemPrice').value = '';
  document.getElementById('itemName').focus();
}

function clearAll() {
  items = [];
  isConvertedToZWL = false;
  exchangeRate = 0;

  document.getElementById('clientName').value = '';
  document.getElementById('clientEmail').value = '';
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

// Document Templates
const DOC_TEMPLATES = {
  'Invoice': {
    title: 'Invoice',
    notes: 'Payment due within 30 days',
    columns: ['Description', 'Quantity', 'Unit Price', 'Amount']
  },
  'Quotation': {
    title: 'Quotation',
    notes: 'Valid for 30 days',
    columns: ['Description', 'Quantity', 'Unit Price', 'Amount']
  },
  'Export': {
    title: 'Export Document',
    notes: 'For customs clearance',
    columns: ['Item Description', 'Quantity', 'Unit Value', 'Total Value']
  },
  'Import': {
    title: 'Import Document',
    notes: 'For customs clearance',
    columns: ['Item Description', 'Quantity', 'Unit Value', 'Total Value']
  }
};

// Generate unique document ID
function generateDocId() {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const prefix = docType === 'Invoice' ? 'INV' : 
                docType === 'Quotation' ? 'QT' : 
                docType === 'Export' ? 'EXP' : 'IMP';
  const counter = localStorage.getItem('ktz_doc_counter') || '000';
  const newCounter = String(parseInt(counter) + 1).padStart(3, '0');
  localStorage.setItem('ktz_doc_counter', newCounter);
  return `${prefix}-${date}-${newCounter}`;
}

function generateInvoiceHTML(docNumber, clientName, date, validUntil) {
  const template = DOC_TEMPLATES[docType];
  const branchName = localStorage.getItem('ktz_branch_name') || 'N/A';
  
  let html = `
  <div style="width: 100%; display: flex; justify-content: center; padding: 40px 20px; box-sizing: border-box;">
    <div style="font-family: 'Poppins', sans-serif; color: #2e1544; background: white; padding: 60px; width: 100%; max-width: 800px; box-sizing: border-box; border-radius: 12px; page-break-inside: avoid; break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
        <div>
          <img src="12.png" alt="KTZ Logo" style="width: 120px; height: auto;" />
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0 0 8px; font-size: 24px; color: #4b2c76;">${template.title} #${docNumber}</h2>
          <p style="margin: 0; font-size: 14px;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Branch:</strong> ${branchName}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Client:</strong> ${clientName}</p>
        </div>
      </div>

      <div style="background: #eae6f8; padding: 30px 35px; border-radius: 12px; margin-bottom: 40px;">
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
          <div style="flex: 1 1 60%;">
            <h2 style="margin: 0 0 8px; font-size: 24px; color: #4b2c76;">KONTROL TEKNIKS ZIMBABWE</h2>
            <h3 style="margin: 0 0 12px; font-size: 16px; color: #7d52c1;">HOME & GARDEN</h3>
            <p style="margin: 0; font-size: 14px;"><strong>Locations:</strong> Zonkizizwe Mall (Bradfield), 96 Cecil Ave Hillside Bulawayo, Sawanga Mall (Victoria Falls)</p>
          </div>
          <div style="flex: 1 1 35%; text-align: right; font-size: 14px; line-height: 1.8;">
            <p><strong>Email:</strong> cathy.linah@icloud.com</p>
            <p><strong>Phone:</strong> +263 772 600 749</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 30px; font-size: 15px;">
        <p><strong>Issued To:</strong> ${clientName}</p>
        <p><strong>Document Type:</strong> ${docType}</p>
        <p><strong>Valid Until:</strong> ${validUntil}</p>
        <p><strong>Notes:</strong> ${template.notes}</p>
      </div>

      <div style="margin-bottom: 30px; font-size: 14px;">
        <p><strong>Banking Details:</strong></p>
        <p><strong>USD ACCOUNT:</strong><br>STANBIC BANK - BELMONT BRANCH - 9140000966400</p>
        <p><strong>ZIG ACCOUNT:</strong><br>STANBIC BANK - BELMONT BRANCH - 9140002769599</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 15px; margin-top: 20px;">
        <thead style="background: #f3f0fa;">
          <tr>
            <th style="padding: 14px; text-align: left;">${template.columns[0]}</th>
            <th style="padding: 14px; text-align: left;">${template.columns[1]}</th>
            <th style="padding: 14px; text-align: right;">${template.columns[2]}</th>
            <th style="padding: 14px; text-align: right;">${template.columns[3]}</th>
          </tr>
        </thead>
        <tbody>`;

  let subtotal = 0;
  items.forEach(item => {
    const total = item.qty * item.price;
    subtotal += total;
    html += `
          <tr>
            <td style="padding: 14px;">${item.name}</td>
            <td style="padding: 14px;">${item.qty} ${item.unit}</td>
            <td style="padding: 14px; text-align: right;">${formatCurrency(item.price)}</td>
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
        <p>Signature: <strong>Linah M</strong></p>
        <p>Date: <strong>${new Date().toLocaleDateString()}</strong></p>
      </div>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666;">
        <p>Generated by KTZ Invoice System</p>
        <p>${new Date().toLocaleString()}</p>
      </div>
    </div>
  </div>`;
  return html;
}

function exportPDF() {
  const clientName = document.getElementById('clientName').value || 'N/A';
  const date = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
  const docNumber = generateDocId();
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

function emailInvoice() {
  const clientEmail = document.getElementById('clientEmail').value.trim();
  const clientName = document.getElementById('clientName').value.trim();
  const docType = document.getElementById('docTypeSelect').value;

  if (!clientEmail) {
    alert('Please enter a client email.');
    return;
  }

  const subject = `${docType} from KTZ`;
  const body = `Hello ${clientName || "Client"},%0D%0A%0D%0AHere is your ${docType} from Kontrol Tekniks Zimbabwe.%0D%0A%0D%0AThank you.%0D%0A– KTZ`;

  // Fix: open mail in new hidden anchor without affecting screen layout
  const mailLink = document.createElement('a');
  mailLink.href = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${body}`;
  mailLink.style.display = 'none';
  document.body.appendChild(mailLink);
  mailLink.click();
  document.body.removeChild(mailLink);
}

// ==========================
// 🔐 Branch Lock & Session Persist
// ==========================

const branchCodes = {
  "0001": "Hillside",
  "0002": "Zonikizizwe",
  "0003": "Vic Falls"
};

// Security settings
const SECURITY = {
  maxAttempts: 3,
  lockoutTime: 60 * 1000, // 1 minute in milliseconds
  salt: 'ktz-invoice-2024' // Optional salt for hashing
};

// Hash function (SHA-256)
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str + SECURITY.salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check if branch is locked
function isBranchLocked() {
  const lockoutUntil = localStorage.getItem('ktz_branch_lockout');
  if (!lockoutUntil) return false;
  
  const now = Date.now();
  if (now < parseInt(lockoutUntil)) {
    const remaining = Math.ceil((parseInt(lockoutUntil) - now) / 1000);
    return remaining;
  }
  
  localStorage.removeItem('ktz_branch_lockout');
  localStorage.removeItem('ktz_branch_attempts');
  return false;
}

// Handle failed attempts
function handleFailedAttempt() {
  let attempts = parseInt(localStorage.getItem('ktz_branch_attempts') || '0') + 1;
  localStorage.setItem('ktz_branch_attempts', attempts.toString());
  
  if (attempts >= SECURITY.maxAttempts) {
    const lockoutUntil = Date.now() + SECURITY.lockoutTime;
    localStorage.setItem('ktz_branch_lockout', lockoutUntil.toString());
    return true;
  }
  return false;
}

// Reset attempt counter
function resetAttempts() {
  localStorage.removeItem('ktz_branch_attempts');
}

function validateBranchCode() {
  const code = document.getElementById('branchCodeInput').value;
  const errorElement = document.getElementById('branchError');
  
  // Check for lockout
  const lockoutRemaining = isBranchLocked();
  if (lockoutRemaining) {
    errorElement.textContent = `Too many attempts. Please try again in ${lockoutRemaining} seconds.`;
    return;
  }
  
  if (!code || !branchCodes[code]) {
    errorElement.textContent = "Invalid branch code. Please try again.";
    if (handleFailedAttempt()) {
      errorElement.textContent = `Too many attempts. Please try again in ${SECURITY.lockoutTime / 1000} seconds.`;
    }
    return;
  }

  const branchName = branchCodes[code];
  // Store hashed code instead of raw code
  hashString(code).then(hashedCode => {
    localStorage.setItem('ktz_branch', hashedCode);
    localStorage.setItem('ktz_branch_name', branchName);
    resetAttempts();
    
    // Update branch display
    document.getElementById('branchDisplay').textContent = branchName;
    document.getElementById('branchDisplay').title = `Branch: ${branchName}`;
    
    // Hide modal
    document.getElementById('branchPrompt').style.display = 'none';
  });
}

function resetBranch() {
  localStorage.removeItem('ktz_branch');
  localStorage.removeItem('ktz_branch_name');
  localStorage.removeItem('ktz_branch_attempts');
  localStorage.removeItem('ktz_branch_lockout');
  document.getElementById('branchDisplay').textContent = '';
  document.getElementById('branchPrompt').style.display = 'flex';
}

function showBranchPrompt() {
  const lockoutRemaining = isBranchLocked();
  if (lockoutRemaining) {
    document.getElementById('branchError').textContent = 
      `Too many attempts. Please try again in ${lockoutRemaining} seconds.`;
  }
  document.getElementById('branchPrompt').style.display = 'flex';
}

(function enforceBranchSession() {
  const savedCode = localStorage.getItem('ktz_branch');
  const savedName = localStorage.getItem('ktz_branch_name');
  
  if (savedCode && savedName) {
    // Verify the stored hash matches any of the valid codes
    Promise.all(Object.keys(branchCodes).map(code => hashString(code)))
      .then(hashes => {
        if (hashes.includes(savedCode)) {
          document.getElementById('branchDisplay').textContent = savedName;
          document.getElementById('branchDisplay').title = `Branch: ${savedName}`;
        } else {
          showBranchPrompt();
        }
      });
  } else {
    showBranchPrompt();
  }
})();

// Invoice Draft System
const DRAFT_KEY = 'ktz_invoice_draft';

function saveDraft() {
  const draft = {
    clientName: document.getElementById('clientName').value,
    clientEmail: document.getElementById('clientEmail').value,
    invoiceDate: document.getElementById('invoiceDate').value,
    items: items,
    docType: docType,
    isConvertedToZWL,
    exchangeRate
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function loadDraft() {
  const draft = localStorage.getItem(DRAFT_KEY);
  if (draft) {
    return JSON.parse(draft);
  }
  return null;
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

// Auto-save on changes
function setupAutoSave() {
  const fields = ['clientName', 'clientEmail', 'invoiceDate'];
  fields.forEach(field => {
    document.getElementById(field).addEventListener('input', saveDraft);
  });
  
  // Save on item changes
  const originalAddItem = addItem;
  addItem = function() {
    originalAddItem.apply(this, arguments);
    saveDraft();
  };
  
  const originalRemoveItem = removeItem;
  removeItem = function() {
    originalRemoveItem.apply(this, arguments);
    saveDraft();
  };
  
  const originalUpdateItemName = updateItemName;
  updateItemName = function() {
    originalUpdateItemName.apply(this, arguments);
    saveDraft();
  };
  
  const originalUpdateItemQty = updateItemQty;
  updateItemQty = function() {
    originalUpdateItemQty.apply(this, arguments);
    saveDraft();
  };
  
  const originalUpdateItemPrice = updateItemPrice;
  updateItemPrice = function() {
    originalUpdateItemPrice.apply(this, arguments);
    saveDraft();
  };
}

// Restore draft on load
function restoreDraft() {
  const draft = loadDraft();
  if (draft) {
    if (confirm('Would you like to continue your previous invoice?')) {
      document.getElementById('clientName').value = draft.clientName || '';
      document.getElementById('clientEmail').value = draft.clientEmail || '';
      document.getElementById('invoiceDate').value = draft.invoiceDate || '';
      items = draft.items || [];
      docType = draft.docType || 'Quotation';
      isConvertedToZWL = draft.isConvertedToZWL || false;
      exchangeRate = draft.exchangeRate || 0;
      
      // Update UI
      document.getElementById('docTypeSelect').value = docType;
      document.querySelector('h1').textContent = `Cathy's ${docType}`;
      updateTable();
    } else {
      clearDraft();
    }
  }
}

// Update clearAll to clear draft
const originalClearAll = clearAll;
clearAll = function() {
  originalClearAll.apply(this, arguments);
  clearDraft();
};

// Update exportPDF to clear draft on success
const originalExportPDF = exportPDF;
exportPDF = function() {
  originalExportPDF.apply(this, arguments);
  clearDraft();
};

// Mobile Enhancements
function setupMobileEnhancements() {
  // Auto-scroll to new items
  const originalAddItem = addItem;
  addItem = function() {
    originalAddItem.apply(this, arguments);
    const lastItem = document.querySelector('.item-row:last-child');
    if (lastItem) {
      lastItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // FAB Button for mobile
  const fabButton = document.createElement('button');
  fabButton.className = 'fab-button';
  fabButton.innerHTML = '+';
  fabButton.onclick = addItem;
  document.body.appendChild(fabButton);

  // Handle input focus on mobile
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
}

// Version Control
let currentVersion = null;
let latestVersion = null;

async function checkVersion() {
  try {
    const response = await fetch('/version.json', { cache: 'no-store' });
    const data = await response.json();
    latestVersion = data.version;
    
    // Update footer
    const footer = document.createElement('footer');
    footer.innerHTML = `
      <div class="version-info">
        v${data.version} • Last Updated: ${data.last_updated}
        ${data.changelog ? `<div class="changelog">${data.changelog.join('<br>')}</div>` : ''}
      </div>
    `;
    document.body.appendChild(footer);
    
    // Check for updates
    if (currentVersion && currentVersion !== latestVersion) {
      if (confirm('A new version is available. Would you like to update now?')) {
        window.location.reload();
      }
    }
    currentVersion = latestVersion;
  } catch (error) {
    console.error('Version check failed:', error);
  }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  let refreshing = false;
  
  navigator.serviceWorker.register('service-worker.js')
    .then(reg => {
      console.log('Service Worker registered:', reg.scope);
      
      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            if (confirm('A new version is available. Would you like to update now?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          }
        });
      });
      
      // Handle version updates from service worker
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'version-update') {
          if (confirm(`Version ${event.data.version} is available. Update now?`)) {
            window.location.reload();
          }
        }
      });
    })
    .catch(err => console.error('Service Worker registration failed:', err));
  
  // Handle controller change (update complete)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

// Edit Item Modal Logic
let editingIndex = null;

function openEditModal(index) {
  editingIndex = index;
  const item = items[index];
  const modal = document.getElementById('editItemModal');
  document.getElementById('editItemName').value = item.name;
  document.getElementById('editItemQty').value = item.qty;
  document.getElementById('editItemPrice').value = item.price;
  document.getElementById('editItemUnit').value = item.unit;
  modal.style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editItemModal').style.display = 'none';
  editingIndex = null;
}

function saveEditItem() {
  if (editingIndex === null) return;
  const name = document.getElementById('editItemName').value.trim();
  const qty = parseFloat(document.getElementById('editItemQty').value);
  const price = parseFloat(document.getElementById('editItemPrice').value);
  const unit = document.getElementById('editItemUnit').value;
  if (!name || qty <= 0 || isNaN(price) || price < 0) {
    alert('Please enter valid item details.');
    return;
  }
  items[editingIndex] = { name, qty, price, unit };
  updateTable();
  closeEditModal();
  saveDraft && saveDraft();
}

// DOM INIT

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addItemBtn').addEventListener('click', addItem);
  document.getElementById('convertZWLBtn').addEventListener('click', convertToZWL);
  document.getElementById('pdfBtn').addEventListener('click', exportPDF);
  document.getElementById('printBtn').addEventListener('click', printInvoice);
  document.getElementById('emailBtn').addEventListener('click', emailInvoice);
  document.getElementById('clearBtn').addEventListener('click', clearAll);

  document.getElementById('docTypeSelect').addEventListener('change', function () {
    docType = this.value;
    document.querySelector('h1').textContent = `Cathy's ${docType}`;
  });

  // Ensure only one unit selector in item entry
  const itemEntry = document.querySelector('.item-entry');
  if (!document.getElementById('itemUnit')) {
    const unitSelect = document.createElement('select');
    unitSelect.id = 'itemUnit';
    units.forEach(unit => {
      const option = document.createElement('option');
      option.value = unit;
      option.textContent = unit;
      unitSelect.appendChild(option);
    });
    itemEntry.insertBefore(unitSelect, document.getElementById('addItemBtn'));
  }

  // Add Enter key support
  document.getElementById('itemName').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('itemQty').focus();
    }
  });

  document.getElementById('itemQty').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('itemPrice').focus();
    }
  });

  document.getElementById('itemPrice').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  });

  // Check version on load
  checkVersion();

  // Setup auto-save and restore draft
  setupAutoSave();
  restoreDraft();

  // Setup mobile enhancements
  setupMobileEnhancements();

  // Add change branch button
  const branchDisplay = document.getElementById('branchDisplay');
  const changeBranchBtn = document.createElement('button');
  changeBranchBtn.className = 'change-branch-btn';
  changeBranchBtn.textContent = 'Change Branch';
  changeBranchBtn.onclick = resetBranch;
  branchDisplay.parentNode.insertBefore(changeBranchBtn, branchDisplay.nextSibling);

  // Modal event listeners
  document.getElementById('editItemCancel').onclick = closeEditModal;
  document.getElementById('editItemSave').onclick = saveEditItem;
});






