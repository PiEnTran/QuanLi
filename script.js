let products = JSON.parse(localStorage.getItem('products')) || [];
let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
let totalRevenue = parseFloat(localStorage.getItem('totalRevenue')) || 0;

let currentPage = 1;
const itemsPerPage = 10; // Số sản phẩm hiển thị mỗi trang
let currentSalesPage = 1; // Trang hiện tại của lịch sử bán hàng

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

    // Tính toán vị trí bắt đầu và kết thúc của sản phẩm trong trang hiện tại
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, products.length);

    // Hiển thị sản phẩm trong khoảng từ startIndex đến endIndex
    for (let i = startIndex; i < endIndex; i++) {
        const product = products[i];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.quantity}</td>
            <td>${formatCurrency(product.revenue)}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct(${i})">Sửa</button>
                <button class="action-btn delete-btn" onclick="deleteProduct(${i})">Xóa</button>
                <button class="action-btn" onclick="sellProduct(${i})">Bán</button>
            </td>
        `;

        tableBody.appendChild(row);
    }

    // Cập nhật số trang hiện tại
    document.getElementById('currentPage').textContent = `Trang ${currentPage}`;
    document.getElementById('prevPage').disabled = currentPage === 1; // Vô hiệu hóa nút "Trước" nếu đang ở trang đầu
    document.getElementById('nextPage').disabled = endIndex >= products.length; // Vô hiệu hóa nút "Sau" nếu không còn sản phẩm để hiển thị
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderProductTable();
    }
}

function nextPage() {
    if ((currentPage * itemsPerPage) < products.length) {
        currentPage++;
        renderProductTable();
    }
}

// Các hàm còn lại không thay đổi

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

    // Tính toán vị trí bắt đầu và kết thúc của lịch sử bán hàng trong trang hiện tại
    const startIndex = (currentSalesPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, salesHistory.length);

    // Hiển thị lịch sử bán hàng trong khoảng từ startIndex đến endIndex
    for (let i = startIndex; i < endIndex; i++) {
        const sale = salesHistory[i];
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${sale.name}</td>
            <td>${sale.quantity}</td>
            <td>${formatCurrency(sale.total)}</td>
            <td>${sale.time}</td>
        `;

        salesTableBody.appendChild(row);
    }

    // Cập nhật số trang hiện tại cho lịch sử bán hàng
    document.getElementById('currentSalesPage').textContent = `Trang ${currentSalesPage}`;
    document.getElementById('prevSalesPage').disabled = currentSalesPage === 1; // Vô hiệu hóa nút "Trước" nếu đang ở trang đầu
    document.getElementById('nextSalesPage').disabled = endIndex >= salesHistory.length; // Vô hiệu hóa nút "Sau" nếu không còn lịch sử để hiển thị
}

function prevSalesPage() {
    if (currentSalesPage > 1) {
        currentSalesPage--;
        renderSalesHistory();
    }
}

function nextSalesPage() {
    if ((currentSalesPage * itemsPerPage) < salesHistory.length) {
        currentSalesPage++;
        renderSalesHistory();
    }
}

function importExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        jsonData.forEach((row, index) => {
            if (index === 0) return; // Bỏ qua hàng đầu tiên (tiêu đề)
            const product = {
                name: row[0],
                price: row[1],
                quantity: row[2],
                revenue: row[1] * row[2]
            };
            products.push(product);
        });

        localStorage.setItem('products', JSON.stringify(products));
        renderProductTable();
    };

    reader.readAsArrayBuffer(file);
}

function clearLocalStorage() {
    localStorage.removeItem('products');
    localStorage.removeItem('salesHistory');
    localStorage.removeItem('totalRevenue');
    products = [];
    salesHistory = [];
    totalRevenue = 0;
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    renderProductTable();
    renderSalesHistory();
}
