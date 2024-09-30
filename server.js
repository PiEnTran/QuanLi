const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Kết nối tới MongoDB
mongoose.connect('mongodb://localhost:27017/productManagement', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const productSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    price: Number
});

const Product = mongoose.model('Product', productSchema);

// API lấy danh sách sản phẩm
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).send('Error loading products: ' + error.message);
    }
});

// API thêm sản phẩm
app.post('/products', async (req, res) => {
    try {
        const { name, quantity, price } = req.body;
        const newProduct = new Product({ name, quantity, price });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).send('Error adding product: ' + error.message);
    }
});

// API chỉnh sửa sản phẩm
app.put('/products/:id', async (req, res) => {
    try {
        const { quantity } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, { quantity }, { new: true });
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).send('Error updating product: ' + error.message);
    }
});

// API xóa sản phẩm
app.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).send('Product deleted');
    } catch (error) {
        res.status(500).send('Error deleting product: ' + error.message);
    }
});

// Chạy server
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
