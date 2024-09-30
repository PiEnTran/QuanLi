// Mảng chứa sản phẩm
let products = JSON.parse(localStorage.getItem('products')) || [];
let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
let currentPage = 1;
let itemsPerPage = 10; // Số sản phẩm mỗi trang

// Hàm lưu sản phẩm vào LocalStorage
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

// Hàm lưu lịch sử bán hàng vào LocalStorage
function saveSalesHistory() {
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
}

// Hàm hiển thị sản phẩm
function displayProducts(productsToDisplay) {
    const tbody = document.querySelector("#productTable tbody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, productsToDisplay.length);

    for (let i = start; i < end; i++) {
        const product = productsToDisplay[i];
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
    updatePagination(productsToDisplay.length);
}

// Hàm thêm sản phẩm
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
    displayProducts(products);
    clearForm();
}

// Hàm tìm kiếm sản phẩm
function searchProduct() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchInput)
    );
    
    if (filteredProducts.length === 0) {
        document.querySelector("#productTable tbody").innerHTML = "<tr><td colspan='5'>Không tìm thấy sản phẩm</td></tr>";
    } else {
        displayProducts(filteredProducts);
    }
}

// Hàm phân trang
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    document.getElementById('currentPage').innerText = `Trang ${currentPage}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Chuyển sang trang trước
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayProducts(products);
    }
}

// Chuyển sang trang sau
function nextPage() {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayProducts(products);
    }
}

// Tải sản phẩm từ LocalStorage khi trang khởi động
window.onload = function() {
    displayProducts(products);
};