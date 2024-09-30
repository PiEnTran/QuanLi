let products = JSON.parse(localStorage.getItem('products')) || [];
let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
let totalRevenue = parseFloat(localStorage.getItem('totalRevenue')) || 0;

const itemsPerPage = 10; // Số sản phẩm và lịch sử trên mỗi trang
let currentPage = 1;
let currentSalesPage = 1;

document.addEventListener("DOMContentLoaded", () => {
    renderProductTable();
    renderSalesHistory();
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
});

function addProduct() {
    const productName = document.getElementById('productName').value;
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productQuantity = parseInt(document.getElementById('productQuantity').value);

    if (productName && !isNaN(productPrice) && !isNaN(productQuantity)) {
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

    // Tính toán chỉ số bắt đầu và kết thúc cho trang hiện tại
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, products.length);
    const paginatedProducts = products.slice(startIndex, endIndex);

    paginatedProducts.forEach((product, index) => {
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

    document.getElementById('currentPage').textContent = `Trang ${currentPage}`;
    document.getElementById('prevPage').disabled = currentPage === 1; // Disable nút trước nếu là trang đầu
    document.getElementById('nextPage').disabled = endIndex >= products.length; // Disable nút sau nếu không còn sản phẩm
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

    // Tính toán chỉ số bắt đầu và kết thúc cho trang hiện tại
    const startIndex = (currentSalesPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, salesHistory.length);
    const paginatedSalesHistory = salesHistory.slice(startIndex, endIndex);

    paginatedSalesHistory.forEach(sale => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${sale.name}</td>
            <td>${sale.quantity}</td>
            <td>${formatCurrency(sale.total)}</td>
            <td>${sale.time}</td>
        `;

        salesTableBody.appendChild(row);
    });

    document.getElementById('currentSalesPage').textContent = `Trang ${currentSalesPage}`;
    document.getElementById('prevSalesPage').disabled = currentSalesPage === 1; // Disable nút trước nếu là trang đầu
    document.getElementById('nextSalesPage').disabled = endIndex >= salesHistory.length; // Disable nút sau nếu không còn lịch sử
}

// Hàm chuyển trang cho danh sách sản phẩm
function nextPage() {
    if ((currentPage * itemsPerPage) < products.length) {
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

// Hàm chuyển trang cho lịch sử bán hàng
function nextSalesPage() {
    if ((currentSalesPage * itemsPerPage) < salesHistory.length) {
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
