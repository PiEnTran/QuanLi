// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDV_SI9YyyoZLqUXRUR8WjPgluc2UYpErI",
    authDomain: "quanli-195dd.firebaseapp.com",
    projectId: "quanli-195dd",
    storageBucket: "quanli-195dd.appspot.com",
    messagingSenderId: "203477206331",
    appId: "1:203477206331:web:9bb8ce391eb8fbbb8aa31e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let products = [];
let salesHistory = [];
let totalRevenue = 0;

let currentPage = 1;
const itemsPerPage = 10; // Number of products displayed per page
let currentSalesPage = 1; // Current page for sales history

document.addEventListener("DOMContentLoaded", () => {
    loadProducts(); // Load products from Firestore
    renderSalesHistory();
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
});

async function loadProducts() {
    const snapshot = await db.collection('products').get();
    products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProductTable();
}

async function addProduct() {
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

        const docRef = await db.collection('products').add(product);
        product.id = docRef.id; // Add the generated ID to the product object
        products.push(product);
        renderProductTable();
        clearForm();
    }
}

async function deleteProduct(id) {
    await db.collection('products').doc(id).delete(); // Delete from Firestore
    products = products.filter(product => product.id !== id); // Update local products array
    renderProductTable();
}

async function renderProductTable() {
    const tableBody = document.querySelector('#productTable tbody');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, products.length);

    for (let i = startIndex; i < endIndex; i++) {
        const product = products[i];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${product.quantity}</td>
            <td>${formatCurrency(product.revenue)}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editProduct('${product.id}')">Sửa</button>
                <button class="action-btn delete-btn" onclick="deleteProduct('${product.id}')">Xóa</button>
                <button class="action-btn" onclick="sellProduct('${product.id}')">Bán</button>
            </td>
        `;

        tableBody.appendChild(row);
    }

    document.getElementById('currentPage').textContent = `Trang ${currentPage}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = endIndex >= products.length;
}

function clearForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productQuantity').value = '';
}

// Các hàm khác (như sellProduct, renderSalesHistory) không thay đổi, chỉ cần thay thế việc lấy và lưu trữ dữ liệu với Firestore tương tự như trên
