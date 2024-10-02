let products = [];
let salesHistory = [];
let currentPage = 1;
let itemsPerPage = 10;

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Kiểm tra tên đăng nhập và mật khẩu
    if (username === 'PiEn' && password === '1234567') {
        localStorage.setItem('loggedIn', 'true'); // Lưu trạng thái đăng nhập
        alert('Đăng nhập thành công!');
        window.location.href = 'index.html'; // Chuyển đến trang chính
    } else {
        alert('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
}

// Thêm sản phẩm
function addProduct() {
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);

    if (!name || price <= 0 || quantity <= 0) {
        alert("Vui lòng nhập thông tin sản phẩm hợp lệ.");
        return;
    }

    const product = { name, price, quantity };
    products.push(product);
    saveProducts();
    loadProducts();
}

// Nhập sản phẩm từ file Excel
function importExcel(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});

        jsonData.forEach((row, index) => {
            if (index === 0) return; // Bỏ qua hàng tiêu đề
            const [name, price, quantity] = row;
            if (name && price > 0 && quantity > 0) {
                const product = { name, price: parseFloat(price), quantity: parseInt(quantity) };
                products.push(product);
            }
        });

        saveProducts();
        loadProducts();
    };

    reader.readAsArrayBuffer(file);
}

// Tải danh sách sản phẩm
function loadProducts() {
    const tbody = document.querySelector("#productTable tbody");
    tbody.innerHTML = "";
    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, products.length);
    
    for (let i = start; i < end; i++) {
        const product = products[i];
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.quantity}</td>
            <td>${product.price * product.quantity}</td>
            <td>
                <button onclick="sellProduct(${i})">Bán</button>
                <button onclick="editProduct(${i})">Chỉnh sửa</button>
                <button onclick="deleteProduct(${i})">Xóa</button>
            </td>
        `;
    }
}

// Lưu danh sách sản phẩm vào localStorage
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

// Tìm kiếm sản phẩm
function searchProduct() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
}

// Hiển thị sản phẩm đã tìm kiếm
function renderProducts(productList) {
    const tbody = document.querySelector("#productTable tbody");
    tbody.innerHTML = "";
    productList.forEach((product, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.quantity}</td>
            <td>${product.price * product.quantity}</td>
            <td>
                <button onclick="sellProduct(${index})">Bán</button>
                <button onclick="editProduct(${index})">Chỉnh sửa</button>
                <button onclick="deleteProduct(${index})">Xóa</button>
            </td>
        `;
    });
}

// Xóa sản phẩm
function deleteProduct(index) {
    products.splice(index, 1);
    saveProducts();
    loadProducts();
}

// Chỉnh sửa sản phẩm
function editProduct(index) {
    const product = products[index];
    const newName = prompt("Tên sản phẩm mới:", product.name);
    const newPrice = parseFloat(prompt("Giá mới (VND):", product.price));
    const newQuantity = parseInt(prompt("Số lượng mới:", product.quantity));

    if (newName && newPrice > 0 && newQuantity > 0) {
        products[index] = { name: newName, price: newPrice, quantity: newQuantity };
        saveProducts();
        loadProducts();
    } else {
        alert("Thông tin sản phẩm không hợp lệ.");
    }
}

// Bán sản phẩm
function sellProduct(index) {
    const product = products[index];
    const soldQuantity = parseInt(prompt("Nhập số lượng bán:"));

    if (soldQuantity > 0 && soldQuantity <= product.quantity) {
        const revenue = soldQuantity * product.price;
        product.quantity -= soldQuantity;

        const sale = {
            name: product.name,
            quantity: soldQuantity,
            revenue: revenue,
            time: new Date().toLocaleString()
        };
        salesHistory.push(sale);
        saveSalesHistory();
        loadProducts();
        loadSalesHistory();
    } else {
        alert("Số lượng bán không hợp lệ.");
    }
}

// Tải lịch sử bán hàng
function loadSalesHistory() {
    const tbody = document.querySelector("#salesHistoryTable tbody");
    tbody.innerHTML = "";
    salesHistory.forEach((sale, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${sale.name}</td>
            <td>${sale.quantity}</td>
            <td>${sale.revenue}</td>
            <td>${sale.time}</td>
            <td><button onclick="deleteSale(${index})">Xóa</button></td>
        `;
    });
    updateTotalRevenue();
}

// Lưu lịch sử bán hàng
function saveSalesHistory() {
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
}

// Xóa lịch sử bán hàng
function deleteSale(index) {
    salesHistory.splice(index, 1);
    saveSalesHistory();
    loadSalesHistory();
}

// Đặt lại lịch sử bán hàng
function resetSalesHistory() {
    salesHistory = [];
    saveSalesHistory();
    loadSalesHistory();
}

// Cập nhật tổng doanh thu
function updateTotalRevenue() {
    const totalRevenue = salesHistory.reduce((total, sale) => total + sale.revenue, 0);
    document.getElementById("totalRevenue").textContent = `${totalRevenue} VND`;
}

// Chuyển trang sản phẩm
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadProducts();
        document.getElementById("currentPage").textContent = `Trang ${currentPage}`;
    }
}

function nextPage() {
    if (currentPage * itemsPerPage < products.length) {
        currentPage++;
        loadProducts();
        document.getElementById("currentPage").textContent = `Trang ${currentPage}`;
    }
}
// Đăng xuất
function logout() {
    // Xóa thông tin người dùng trong localStorage (nếu cần)
    localStorage.removeItem('user');

    // Chuyển hướng về trang đăng nhập (thay đổi đường dẫn nếu cần)
    window.location.href = 'login.html';
}

// Khởi tạo dữ liệu khi tải trang
window.onload = function () {
    products = JSON.parse(localStorage.getItem('products')) || [];
    salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    loadProducts();
    loadSalesHistory();
};