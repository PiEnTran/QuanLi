
let products = [];
let salesHistory = [];
let currentPage = 1;
let itemsPerPage = 10;

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

function sellProduct(index) {
    const quantityToSell = parseInt(prompt("Nhập số lượng muốn bán:"));
    if (quantityToSell > products[index].quantity) {
        alert("Số lượng bán vượt quá số lượng tồn kho.");
        return;
    }

    const sale = {
        name: products[index].name,
        quantity: quantityToSell,
        total: products[index].price * quantityToSell,


time: new Date().toLocaleString(),
    };

    salesHistory.push(sale);
    products[index].quantity -= quantityToSell;
    saveProducts();
    saveSalesHistory();
    loadProducts();
    loadSalesHistory();
}

function editProduct(index) {
    const name = prompt("Nhập tên sản phẩm mới:", products[index].name);
    const price = parseFloat(prompt("Nhập giá mới (VND):", products[index].price));
    const quantity = parseInt(prompt("Nhập số lượng mới:", products[index].quantity));

    if (name && price > 0 && quantity >= 0) {
        products[index] = { name, price, quantity };
        saveProducts();
        loadProducts();
    } else {
        alert("Vui lòng nhập thông tin hợp lệ.");
    }
}

function deleteProduct(index) {
    products.splice(index, 1);
    saveProducts();
    loadProducts();
}

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

function saveSalesHistory() {
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
}

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
    updateTotalRevenue();
}

function deleteSale(index) {
    salesHistory.splice(index, 1);
    saveSalesHistory();
    loadSalesHistory();
}

function resetSalesHistory() {
    if (confirm("Bạn có chắc chắn muốn xóa lịch sử bán hàng không?")) {
        salesHistory = [];
        saveSalesHistory();
        loadSalesHistory();
    }
}

function updateTotalRevenue() {
    const totalRevenue = salesHistory.reduce((acc, sale) => acc + sale.total, 0);
    document.getElementById("totalRevenue").innerText = `${totalRevenue} VND`;
}

// Hàm quản lý phân trang
function nextPage() {
    if (currentPage * itemsPerPage < products.length) {
        currentPage++;
        loadProducts();
        document.getElementById('currentPage').innerText = `Trang ${currentPage}`;
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadProducts();
        document.getElementById('currentPage').innerText = `Trang ${currentPage}`;
    }
}

// Tải dữ liệu từ localStorage khi tải trang
window.onload = function () {
    products = JSON.parse(localStorage.getItem('products')) || [];
    salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
    loadProducts();
    loadSalesHistory();
};