let products = [];
let salesHistory = [];
let currentPage = 1;
let itemsPerPage = 10;

// Hàm thêm sản phẩm
async function addProduct() {
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);

    if (!name || price <= 0 || quantity <= 0) {
        alert("Vui lòng nhập thông tin sản phẩm hợp lệ.");
        return;
    }

    const product = { name, price, quantity };
    products.push(product);
    
    // Thêm sản phẩm vào Firestore
    await addProductToFirestore(product);
    
    saveProducts();
    loadProducts();
}

// Thêm sản phẩm vào Firestore
async function addProductToFirestore(product) {
    try {
        const docRef = await db.collection('products').add(product);
        console.log("Sản phẩm đã được thêm với ID: ", docRef.id);
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm: ", error);
    }
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
async function loadProducts() {
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
    updatePagination();
}

// Lưu danh sách sản phẩm vào localStorage
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

// Bán sản phẩm
function sellProduct(index) {
    const quantitySold = parseInt(prompt("Nhập số lượng bán:"));
    if (quantitySold > 0 && quantitySold <= products[index].quantity) {
        products[index].quantity -= quantitySold;
        salesHistory.push({
            name: products[index].name,
            quantity: quantitySold,
            total: products[index].price * quantitySold,
            time: new Date().toLocaleString()
        });
        saveProducts();
        saveSalesHistory();
        loadProducts();
        loadSalesHistory();
        alert("Bán hàng thành công!");
    } else {
        alert("Số lượng bán không hợp lệ.");
    }
}

// Lưu lịch sử bán hàng vào localStorage
function saveSalesHistory() {
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
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
            <td>${sale.total}</td>
            <td>${sale.time}</td>
            <td><button onclick="deleteSale(${index})">Xóa</button></td>
        `;
    });
    calculateTotalRevenue();
    updateSalesPagination();
}

// Tính tổng doanh thu
function calculateTotalRevenue() {
    const total = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
    document.getElementById('totalRevenue').innerText = `${total} VND`;
}

// Xóa sản phẩm
function deleteProduct(index) {
    products.splice(index, 1);
    saveProducts();
    loadProducts();
}

// Xóa lịch sử bán hàng
function deleteSale(index) {
    salesHistory.splice(index, 1);
    saveSalesHistory();
    loadSalesHistory();
}

// Tìm kiếm sản phẩm
function searchProduct() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = products.filter(product => product.name.toLowerCase().includes(input));
    
    const tbody = document.querySelector("#productTable tbody");
    tbody.innerHTML = "";
    filteredProducts.forEach(product => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.quantity}</td>
            <td>${product.price * product.quantity}</td>
            <td>
                <button onclick="sellProduct(${products.indexOf(product)})">Bán</button>
                <button onclick="editProduct(${products.indexOf(product)})">Chỉnh sửa</button>
                <button onclick="deleteProduct(${products.indexOf(product)})">Xóa</button>
            </td>
        `;
    });
}

// Phân trang sản phẩm
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadProducts();
    }
}

function nextPage() {
    if (currentPage < Math.ceil(products.length / itemsPerPage)) {
        currentPage++;
        loadProducts();
    }
}

// Cập nhật hiển thị phân trang
function updatePagination() {
    document.getElementById('currentPage').innerText = `Trang ${currentPage}`;
}

// Phân trang lịch sử bán hàng
let currentSalesPage = 1;

function prevSalesPage() {
    if (currentSalesPage > 1) {
        currentSalesPage--;
        loadSalesHistory();
    }
}

function nextSalesPage() {
    if (currentSalesPage < Math.ceil(salesHistory.length / itemsPerPage)) {
        currentSalesPage++;
        loadSalesHistory();
    }
}

// Cập nhật hiển thị phân trang lịch sử
function updateSalesPagination() {
    document.getElementById('currentSalesPage').innerText = `Trang ${currentSalesPage}`;
}

// Xóa lịch sử bán hàng
function resetSalesHistory() {
    salesHistory = [];
    saveSalesHistory();
    loadSalesHistory();
}

// Chỉnh sửa sản phẩm
function editProduct(index) {
    const name = prompt("Nhập tên sản phẩm mới:", products[index].name);
    const price = prompt("Nhập giá mới:", products[index].price);
    const quantity = prompt("Nhập số lượng mới:", products[index].quantity);

    if (name) products[index].name = name;
    if (price) products[index].price = parseFloat(price);
    if (quantity) products[index].quantity = parseInt(quantity);

    saveProducts();
    loadProducts();
}

// Khi tải trang, lấy danh sách sản phẩm và lịch sử bán hàng từ localStorage
window.onload = function() {
    const storedProducts = localStorage.getItem('products');
    const storedSalesHistory = localStorage.getItem('salesHistory');
    
    if (storedProducts) products = JSON.parse(storedProducts);
    if (storedSalesHistory) salesHistory = JSON.parse(storedSalesHistory);
    
    loadProducts();
    loadSalesHistory();
};
