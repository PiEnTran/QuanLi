const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Kết nối tới MongoDB
mongoose.connect('mongodb://localhost:27017/productManagement', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Kết nối tới MySQL
const connection = mysql.createConnection({
    host: 'localhost', // Địa chỉ của MySQL server
    user: 'PiEn',      // Tên đăng nhập MySQL
    password: '1234567',// Mật khẩu MySQL
    database: 'product_management' // Tên cơ sở dữ liệu
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
});

// Định nghĩa schema cho MongoDB
const productSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    price: Number
});

const Product = mongoose.model('Product', productSchema);

// API lấy danh sách sản phẩm từ MySQL
app.get('/products', async (req, res) => {
    const query = `SELECT * FROM products`;
    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Error loading products: ' + err.message);
        }
        res.status(200).json(results);
    });
});

// API thêm sản phẩm vào MySQL
app.post('/products', async (req, res) => {
    const { name, quantity, price } = req.body;
    const query = `INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)`;
    connection.query(query, [name, price, quantity], (err, results) => {
        if (err) {
            return res.status(500).send('Error adding product: ' + err.message);
        }
        res.status(201).json({ id: results.insertId, name, quantity, price });
    });
});

// Bắt đầu server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});