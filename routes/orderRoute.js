const express = require('express')
const router = express.Router()
const { isAuthenticate } = require('../utils/isAuthenticate')
const Order = require('../models/orderModel')
router.route('/new/order').post(isAuthenticate, createOrder)

async function createOrder(req, res) {
    try {
        const { product, qty, seller, totalPrice } = req.body;
        const order = await Order.create({ product, qty, totalPrice, seller, buyer: req.user._id });
        res.status(200).json({ order })
    } catch (error) {
        if (error.name === 'ValidationError') {
            let errors = {}
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            })
            return res.status(400).json({ errors })
        }
        return res.status(400).json({ error: "somthing went wrong" })
    }
}
router.route('/orders').get(isAuthenticate, getAllOrders)
async function getAllOrders(req, res) {
    try {
        const orders = await Order.find()
        res.status(200).json({ orders })
    } catch (error) {
        res.status(400).json({ error: "somthing went wrong" })
    }
}
router.route('/order/:id').patch(isAuthenticate, updateOrder)
async function updateOrder(req, res) {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ order })
    } catch (error) {
        res.status(400).json({ error: 'somthing went wrong' })
    }
}
module.exports = router