const express = require('express');
const router = express.Router();
const { isAuthenticate } = require('../utils/isAuthenticate');
const Razorpay = require('razorpay');
const Order = require('../models/orderModel');
const Product=require('../models/productModel')
const crypto = require('crypto');
const instance = new Razorpay({
	key_id: process.env.RAZOR_API_KEY,
	key_secret: process.env.RAZOR_API_SECRET
});
router.route('/key').get(isAuthenticate, sendKey);
async function sendKey(req, res) {
	try {
		res.status(200).json({ key: process.env.RAZOR_API_KEY });
	} catch (error) {
		res.status(400).json({ error: 'somthing went wrong' });
	}
}

router.route('/checkout').post(checkOut);

async function checkOut(req, res) {
	try {
		const options = {
			currency: 'INR',
			amount: Number(req.body.amount) * 100
		};
		const order = await instance.orders.create(options);
		res.status(200).json({ order });
	} catch (error) {}
}
router.route('/payment-verification').post(paymentVerification);
async function paymentVerification(req, res) {
	try {
		const { razorpay_order_id, razorpay_payment_id, razorpay_signature, itemsArray } = req.body;
		const body = razorpay_order_id + '|' + razorpay_payment_id;
		const expected_signature = crypto
			.createHmac('sha256', process.env.RAZOR_API_SECRET)
			.update(body.toString())
			.digest('hex');

		if (expected_signature === razorpay_signature) {
			res.status(200).json({razorpay_order_id,razorpay_payment_id,razorpay_signature})
		}else{
            res.status(400).json({error:'payment failed'})
        }
	} catch (error) {
        res.status(400).json({error:'payment fa'})
    }
}
router.route('/new/order').post(isAuthenticate, createOrder);
async function createOrder(req, res) {
	try {
		const { itemsArray,paymentDetails,shippingDetail } = req.body;
		let myorders = [];
		for (let i = 0; i < itemsArray.length; i++) {
			const { _id: product, qty, seller, price } = itemsArray[i];
			const order = await Order.create({ product, qty, totalPrice: price*qty, seller, buyer: req.user._id,paymentDetails,shippingDetail });
			const _id=product;
			await Product.findByIdAndUpdate(_id,{stock:itemsArray[i].stock-qty},{new:true})
			myorders.push(order);
		}
		res.status(200).json({ success:true });
	} catch (error) {
		if (error.name === 'ValidationError') {
			let errors = {};
			Object.keys(error.errors).forEach((key) => {
				errors[key] = error.errors[key].message;
			});
			return res.status(400).json({ errors });
		}
		return res.status(400).json({ error: 'somthing went wrong' });
	}
}
router.route('/order').get(isAuthenticate, getAllOrders);
async function getAllOrders(req, res) {
	try {
		const orders = await Order.find({ buyer: req.user._id }).populate('product').sort({createdAt:-1});
		res.status(200).json({ orders });
	} catch (error) {
		res.status(400).json({ error: 'somthing went wrong' });
	}
}
router.route('/order/:id').get(isAuthenticate,sendOrderDetails).patch(isAuthenticate, updateOrder);
async function updateOrder(req, res) {
	try {
		const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
		res.status(200).json({ order });
	} catch (error) {
		res.status(400).json({ error: 'somthing went wrong' });
	}
}
async function sendOrderDetails(req,res){
	try {
		const order=await Order.findById(req.params.id).populate('product');
		res.status(200).json({order})
	} catch (error) {
		res.status(400).json({error:'Somthing Went Wrong'});
	}
}
module.exports = router;
