// Nhập các chức năng Firestore từ Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Cấu hình Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyBikkw-J4Ze4LmbuFivf4et_lOf16lD2mI',
    authDomain: 'quanlisp-91d9d.firebaseapp.com',
    databaseURL: 'https://quanlisp-91d9d-default-rtdb.firebaseio.com',
    projectId: 'quanlisp-91d9d',
    storageBucket: 'quanlisp-91d9d.appspot.com',
    messagingSenderId: '1089855252032',
    appId: '1:1089855252032:web:84d70af66fdaa44c16e1a5',
    measurementId: 'G-ZHJ70NEQ6H'
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    
    // Thêm sản phẩm vào Firestore
    await addProductToFirestore(product);
    
    alert("Sản phẩm đã được thêm thành công!"); // Thông báo thành công
    loadProducts();
}

// Thêm sản phẩm vào Firestore
async function addProductToFirestore(product) {
    try {
        const docRef = await addDoc(collection(db, 'products'), product);
        console.log("Sản phẩm đã được thêm với ID: ", docRef.id);
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm: ", error);
        alert("Đã xảy ra lỗi khi thêm sản phẩm.");
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
                addProductToFirestore(product) // Thêm sản phẩm vào Firestore
                    .catch(error => {
                        console.error("Lỗi khi thêm sản phẩm từ Excel: ", error);
                        alert("Đã xảy ra lỗi khi thêm sản phẩm từ file Excel.");
                    });
            }
        });
        
        loadProducts();
    };

    reader.readAsArrayBuffer(file);
}

// Tải danh sách sản phẩm từ Firestore
function loadProducts() {
    const tbody = document.querySelector("#productTable tbody");
    tbody.innerHTML = ""; // Xóa nội dung trước đó

    // Lắng nghe thay đổi trong bộ sưu tập 'products'
    const productsCollection = collection(db, 'products');
    onSnapshot(productsCollection, (snapshot) => {
        tbody.innerHTML = ""; // Xóa nội dung trước đó mỗi lần cập nhật

        snapshot.forEach((doc) => {
            const product = { id: doc.id, ...doc.data() };
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${product.quantity}</td>
                <td>${product.price * product.quantity}</td>
                <td>
                    <button onclick="sellProduct('${product.id}')">Bán</button>
                    <button onclick="editProduct('${product.id}')">Chỉnh sửa</button>
                    <button onclick="deleteProduct('${product.id}')">Xóa</button>
                </td>
            `;
        });
    });
}

// Bán sản phẩm
async function sellProduct(productId) {
    const quantitySold = parseInt(prompt("Nhập số lượng bán:"));
    const productRef = doc(db, 'products', productId);
    const productSnapshot = await getDocs(productRef);
    
    if (productSnapshot.exists()) {
        const product = productSnapshot.data();
        if (quantitySold > product.quantity) {
            alert("Số lượng bán không được lớn hơn số lượng tồn kho.");
            return;
        }

        // Cập nhật số lượng tồn kho
        await updateDoc(productRef, {
            quantity: product.quantity - quantitySold
        });

        const sale = {
            productId,
            name: product.name,
            quantitySold,
            total: quantitySold * product.price,
            timestamp: new Date()
        };
        await addSaleToFirestore(sale); // Thêm giao dịch vào Firestore
        loadSalesHistory(); // Tải lại lịch sử bán hàng
        loadProducts(); // Tải lại danh sách sản phẩm
    }
}

// Thêm giao dịch bán hàng vào Firestore
async function addSaleToFirestore(sale) {
    try {
        await addDoc(collection(db, 'sales'), sale);
    } catch (error) {
        console.error("Lỗi khi thêm giao dịch bán hàng: ", error);
    }
}

// Tải lịch sử bán hàng
async function loadSalesHistory() {
    const tbody = document.querySelector("#salesHistoryTable tbody");
    tbody.innerHTML = "";

    const salesCollection = collection(db, 'sales');
    const querySnapshot = await getDocs(salesCollection);
    let totalRevenue = 0;

    querySnapshot.forEach((doc) => {
        const sale = doc.data();
        totalRevenue += sale.total;
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${sale.name}</td>
            <td>${sale.quantitySold}</td>
            <td>${sale.total}</td>
            <td>${sale.timestamp.toDate().toLocaleString()}</td>
            <td>
                <button onclick="deleteSale('${doc.id}')">Xóa</button>
            </td>
        `;
    });

    document.getElementById('totalRevenue').innerText = `${totalRevenue} VND`;
}

// Xóa sản phẩm
async function deleteProduct(productId) {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
        await deleteDoc(doc(db, 'products', productId));
        alert("Sản phẩm đã được xóa thành công!"); // Thông báo thành công
        loadProducts(); // Tải lại danh sách sản phẩm
    }
}

// Xóa giao dịch bán hàng
async function deleteSale(saleId) {
    if (confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) {
        await deleteDoc(doc(db, 'sales', saleId));
        loadSalesHistory(); // Tải lại lịch sử bán hàng
    }
}

// Tìm kiếm sản phẩm
function searchProduct() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#productTable tbody tr');

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        const name = cells[0].textContent.toLowerCase();
        if (name.includes(input)) {
            row.style.display = ''; // Hiện hàng
        } else {
            row.style.display = 'none'; // Ẩn hàng
        }
    });
}

// Đặt lại lịch sử bán hàng
async function resetSalesHistory() {
    const confirmReset = confirm("Bạn có chắc chắn muốn xóa tất cả lịch sử bán hàng?");
    if (confirmReset) {
        const salesRef = collection(db, 'sales');
        const snapshot = await getDocs(salesRef);
        snapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        salesHistory = []; // Đặt lại mảng lịch sử bán hàng
        loadSalesHistory(); // Tải lại lịch sử bán hàng
    }
}

// Hàm khởi động
window.onload = function () {
    loadProducts();
    loadSalesHistory();
};
