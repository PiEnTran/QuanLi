let products = [];
let salesHistory = [];
let totalRevenue = 0;
let currentPage = 1;
const itemsPerPage = 10;

// Thêm sản phẩm
function addProduct() {
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);
    const totalRevenueForProduct = price * quantity;

    const product = { name, price, quantity, totalRevenueForProduct };
    products.push(product);
    renderProducts();

    // Xóa input sau khi thêm
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productQuantity').value = '';
}

// Hiển thị sản phẩm
function renderProducts() {
    const tableBody = document.querySelector('#productTable tbody');
    tableBody.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = products.slice(start, end);

    paginatedProducts.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.quantity}</td>
            <td>${product.totalRevenueForProduct}</td>
            <td>
                <button onclick="editProduct(${start + index})" class="edit-btn">Chỉnh sửa</button>
                <button onclick="deleteProduct(${start + index})" class="delete-btn">Xóa</button>
                <button onclick="sellProduct(${start + index})" class="sell-btn">Bán hàng</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('currentPage').innerText = `Trang ${currentPage}`;
}

// Xóa sản phẩm
function deleteProduct(index) {
    products.splice(index, 1);
    renderProducts();
}

// Chỉnh sửa sản phẩm
function editProduct(index) {
    const product = products[index];
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productQuantity').value = product.quantity;

    deleteProduct(index);
}

// Bán hàng
function sellProduct(index) {
    const product = products[index];
    const quantitySold = parseInt(prompt("Nhập số lượng đã bán:", 1));

    if (quantitySold && quantitySold > 0 && quantitySold <= product.quantity) {
        product.quantity -= quantitySold;
        const totalPrice = product.price * quantitySold;
        totalRevenue += totalPrice; // Cập nhật tổng doanh thu
        addToSalesHistory(product.name, quantitySold, totalPrice);
        renderProducts(); // Cập nhật bảng sản phẩm
        renderTotalRevenue(); // Cập nhật tổng doanh thu
        alert(`Đã bán ${quantitySold} ${product.name}.`);
    } else {
        alert("Số lượng bán không hợp lệ!");
    }
}

// Cập nhật tổng doanh thu
function renderTotalRevenue() {
    document.getElementById('totalRevenue').innerText = `${totalRevenue} VND`;
}

// Xóa tất cả dữ liệu
function clearLocalStorage() {
    products = [];
    salesHistory = [];
    totalRevenue = 0;
    renderProducts();
    renderTotalRevenue();
}

// Lịch sử bán hàng
function addToSalesHistory(productName, quantitySold, totalPrice) {
    const sale = {
        productName,
        quantitySold,
        totalPrice,
        time: new Date().toLocaleString()
    };
    salesHistory.push(sale);
    renderSalesHistory();
}

// Hiển thị lịch sử bán hàng
function renderSalesHistory() {
    const tableBody = document.querySelector('#salesHistoryTable tbody');
    tableBody.innerHTML = '';

    salesHistory.forEach(sale => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sale.productName}</td>
            <td>${sale.quantitySold}</td>
            <td>${sale.totalPrice}</td>
            <td>${sale.time}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Nhập dữ liệu từ Excel
function importExcel(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        jsonData.forEach(row => {
            const name = row[0];
            const price = parseFloat(row[1]);
            const quantity = parseInt(row[2]);
            if (name && !isNaN(price) && !isNaN(quantity)) {
                const totalRevenueForProduct = price * quantity;
                const product = { name, price, quantity, totalRevenueForProduct };
                products.push(product);
            }
        });

        renderProducts();
    };
    reader.readAsArrayBuffer(file);
}

// Các hàm phân trang
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderProducts();
    }
}

function nextPage() {
    if (currentPage * itemsPerPage < products.length) {
        currentPage++;
        renderProducts();
    }
}

function prevSalesPage() {
    // Thêm mã tương tự cho lịch sử bán hàng
}

function nextSalesPage() {
    // Thêm mã tương tự cho lịch sử bán hàng
}
