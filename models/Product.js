const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  name: String,
  type: String,
  ingredients: [String],
  status: String,
  scannedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
