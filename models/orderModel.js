const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product"
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    buyer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    qty: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "pending"
    }
})

module.exports = new mongoose.model("Order", orderSchema)