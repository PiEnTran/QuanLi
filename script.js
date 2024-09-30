let products = JSON.parse(localStorage.getItem('products')) || [];
let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
let totalRevenue = parseFloat(localStorage.getItem('totalRevenue')) || 0;

let currentPage = 1;
const productsPerPage = 10;
let currentSalesPage = 1;
const salesPerPage = 10;

document.addEventListener("DOMContentLoaded", () => {
    renderProductTable();
    renderSalesHistory();
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    updatePageInfo();
    updateSalesPageInfo();
});

function addProduct() {
    const productName = document.getElementById('productName').value;
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productQuantity = parseInt(document.getElementById('productQuantity').value);

    if (productName && productPrice && productQuantity) {
        const product = {
            name: productName,
            price: productPrice,
            quantity: productQuantity,
            revenue: productPrice * productQuantity
        };

        products.push(product);
        localStorage.setItem('products', JSON.stringify(products));
        renderProductTable();
        clearForm();
    }
}

function renderProductTable() {
    const tableBody = document.querySelector('#productTable tbody');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = products.slice(startIndex, endIndex);

    currentProducts.forEach((product, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.quantity}</td>
            <td>${formatCurrency(product.revenue)}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${startIndex + index})">Sửa</button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${startIndex + index})">Xóa</button>
                <button class="action-btn" onclick="sellProduct(${startIndex + index})">Bán</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    updatePageInfo();
}

function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function clearForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productQuantity').value = '';
}

function deleteProduct(index) {
    products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(products));
    renderProductTable();
}

function editProduct(index) {
    const product = products[index];
    
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productQuantity').value = product.quantity;

    deleteProduct(index);
}

function sellProduct(index) {
    const product = products[index];
    const quantitySold = prompt(`Nhập số lượng muốn bán (tối đa ${product.quantity}):`);

    if (quantitySold > 0 && quantitySold <= product.quantity) {
        const soldRevenue = product.price * quantitySold;
        
        totalRevenue += soldRevenue;
        localStorage.setItem('totalRevenue', totalRevenue);
        document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
        
        const saleTime = new Date().toLocaleString();
        salesHistory.push({
            name: product.name,
            quantity: quantitySold,
            total: soldRevenue,
            time: saleTime
        });
        localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
        renderSalesHistory();

        product.quantity -= quantitySold;
        if (product.quantity === 0) {
            deleteProduct(index);
        } else {
            localStorage.setItem('products', JSON.stringify(products));
            renderProductTable();
        }
    }
}

function renderSalesHistory() {
    const salesTableBody = document.querySelector('#salesHistoryTable tbody');
    salesTableBody.innerHTML = '';

    const startIndex = (currentSalesPage - 1) * salesPerPage;
    const endIndex = startIndex + salesPerPage;
    const currentSales = salesHistory.slice(startIndex, endIndex);

    currentSales.forEach(sale => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${sale.name}</td>
            <td>${sale.quantity}</td>
            <td>${formatCurrency(sale.total)}</td>
            <td>${sale.time}</td>
        `;

        salesTableBody.appendChild(row);
    });

    updateSalesPageInfo();
}

function clearLocalStorage() {
    localStorage.clear();
    products = [];
    salesHistory = [];
    totalRevenue = 0;
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    renderProductTable();
    renderSalesHistory();
}

function updatePageInfo() {
    document.getElementById('currentPage').textContent = `Trang ${currentPage}`;
}

function nextPage() {
    if (currentPage < Math.ceil(products.length / productsPerPage)) {
        currentPage++;
        renderProductTable();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderProductTable();
    }
}

function updateSalesPageInfo() {
    document.getElementById('currentSalesPage').textContent = `Trang ${currentSalesPage}`;
}

function nextSalesPage() {
    if (currentSalesPage < Math.ceil(salesHistory.length / salesPerPage)) {
        currentSalesPage++;
        renderSalesHistory();
    }
}

function prevSalesPage() {
    if (currentSalesPage > 1) {
        currentSalesPage--;
        renderSalesHistory();
    }
}
