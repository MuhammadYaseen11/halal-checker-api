const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const Product = require('./models/Product');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Error:", err));

// Haram Ingredients List
const haramIngredients = ["pork", "alcohol", "gelatin", "lard", "blood"];

// API Route: Scan Product
app.post('/scan-product', async (req, res) => {
  const { barcode } = req.body;

  try {
    let product = await Product.findOne({ barcode });

    // If product not found
    if (!product) {
      return res.json({
        status: "Product Not Available",
        message: "Do you want to add this product?",
        barcode
      });
    }

    // Check Status
    if (product.type.toLowerCase() === "non-food") {
      product.status = "Non-Food Item";
    } else if (product.ingredients.length > 0) {
      const isHaram = product.ingredients.some(ingredient =>
        haramIngredients.includes(ingredient.toLowerCase())
      );
      product.status = isHaram ? "Haram" : "Halal";
    } else {
      product.status = "Unknown";
    }

    await product.save();

    res.json({
      barcode: product.barcode,
      name: product.name,
      status: product.status,
      ingredients: product.ingredients,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// API Route: Add New Product
app.post('/add-product', async (req, res) => {
  const { barcode, name, type, ingredients, status } = req.body;

  try {
    const existingProduct = await Product.findOne({ barcode });

    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists." });
    }

    const newProduct = new Product({
      barcode,
      name,
      type,
      ingredients,
      status,
    });

    await newProduct.save();

    res.json({ message: "Product added successfully.", product: newProduct });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Start Server
app.listen(process.env.PORT, () => {
  console.log(`🚀 API running at http://localhost:${process.env.PORT}`);
});


