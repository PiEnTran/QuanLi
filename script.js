let products = JSON.parse(localStorage.getItem('products')) || [];
let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
let totalRevenue = parseFloat(localStorage.getItem('totalRevenue')) || 0;

document.addEventListener("DOMContentLoaded", () => {
    renderProductTable();
    renderSalesHistory();
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
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
        localStorage.setItem('products', JSON.stringify(products)); // Lưu vào Local Storage
        renderProductTable();
        clearForm();
    }
}

function renderProductTable() {
    const tableBody = document.querySelector('#productTable tbody');
    tableBody.innerHTML = '';

    products.forEach((product, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.quantity}</td>
            <td>${formatCurrency(product.revenue)}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${index})">Sửa</button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${index})">Xóa</button>
                <button class="action-btn" onclick="sellProduct(${index})">Bán</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
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
    localStorage.setItem('products', JSON.stringify(products)); // Cập nhật Local Storage
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
        
        // Cập nhật tổng doanh thu
        totalRevenue += soldRevenue;
        localStorage.setItem('totalRevenue', totalRevenue); // Lưu tổng doanh thu vào Local Storage
        document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
        
        // Thêm vào lịch sử bán hàng với thời gian hiện tại
        const saleTime = new Date().toLocaleString(); // Lấy thời gian bán
        salesHistory.push({
            name: product.name,
            quantity: quantitySold,
            total: soldRevenue,
            time: saleTime
        });
        localStorage.setItem('salesHistory', JSON.stringify(salesHistory)); // Lưu lịch sử bán hàng vào Local Storage
        renderSalesHistory();

        // Cập nhật số lượng sản phẩm còn lại
        product.quantity -= quantitySold;
        if (product.quantity === 0) {
            deleteProduct(index);
        } else {
            localStorage.setItem('products', JSON.stringify(products)); // Cập nhật Local Storage
            renderProductTable();
        }
    }
}

function renderSalesHistory() {
    const salesTableBody = document.querySelector('#salesHistoryTable tbody');
    salesTableBody.innerHTML = '';

    salesHistory.forEach(sale => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${sale.name}</td>
            <td>${sale.quantity}</td>
            <td>${formatCurrency(sale.total)}</td>
            <td>${sale.time}</td>
        `;

        salesTableBody.appendChild(row);
    });
}
