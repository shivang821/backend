const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const sendToken = require('../utils/sendToken');
const { isAuthenticate } = require('../utils/isAuthenticate');
const Cart = require('../models/cartModel');
const Razorpay=require('razorpay')
router.route('/signup').post(signupUser);
const Product = require('../models/productModel')
async function signupUser(req, res) {
	try {
		const { email, name, password } = req.body;
		let user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({ error: 'user already exist' });
		}
		user = await User.create({ email, name, password });
		sendToken(user, res, 'user registerd');
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
router.route('/login').post(loginUser);
async function loginUser(req, res) {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ error: 'please fill email and password correctly' });
		}
		let user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ error: 'user not found' });
		}
		const isMatch = await user.comparePassword(password);
		if (isMatch) {
			sendToken(user, res, 'user loged in successfully');
		} else {
			return res.status(400).json({ error: 'invalid details' });
		}
	} catch (error) {
		res.status(400).json({ error: 'somthing went wrong' });
	}
}
router.route('/logout').get(logOutUser);

async function logOutUser(req, res) {
	try {
		res.cookie('token', null, { expires: new Date(Date.now()), httpOnly: true });
		res.status(200).json({ success: true, message: 'user logged out' });
	} catch (error) {
		res.status(400).json({ error: 'somthing went wrong' });
	}
}
router.route('/me').get(isAuthenticate, sendUser).patch(isAuthenticate,updateUser);
async function sendUser(req, res) {
	try {
		res.status(200).json({ user: req.user });
	} catch (error) {
		res.status(400).json({ error: 'somthing went wrong' });
	}
}
async function updateUser(req,res){
	try {
		const user=await User.findByIdAndUpdate(req.user._id,{shippingDetails:req.body},{new:true})
		res.status(200).json({user})
	} catch (error) {
		res.status(400).json({error:'somthing went wrong'})
	}
}
router.route('/makemeseller').patch(isAuthenticate, updateMe);
async function updateMe(req, res) {
	try {
		let user = await User.findByIdAndUpdate(req.user._id, { role: 'seller', pan: req.body.pan }, { new: true });
		res.status(200).json({ user });
	} catch (error) {
		res.status(400).json({ error: 'somthing went wrong' });
	}
}
router.route('/addToCart').post(isAuthenticate, AddToCart).get(isAuthenticate, sendCart);
async function AddToCart(req, res) {
	try {
		let myCart = await Cart.findOne({ _id: req.user._id });
		
		if (myCart) {
			const id = req.body.item;
			myCart.cartItems = myCart.cartItems.filter((itm) => {
				return !itm.item.equals(id);
			});
			myCart.cartItems = [ ...myCart.cartItems, req.body ];
			await myCart.save();
		} else {
			myCart = await Cart.create({ _id: req.user._id, cartItems: req.body });
		}
		myCart = await myCart.populate('cartItems.item');
		const cartItems = [];
		myCart.cartItems.forEach((ele) => {
			const { item, itemQty } = ele;
			const data = {
				name: item.name,
				desc: item.desc,
				price: item.price,
				seller: item.seller,
				stock: item.stock,
				image: item.images[0].url,
				_id: item._id,
				rating: item.rating,
				qty: itemQty
			};
			cartItems.push(data);
		});
		res.status(200).json({ cartItems });
	} catch (error) {
		res.status(400).json({ error: 'Somthing went wrong' });
	}
}
async function sendCart(req, res) {
	try {
		const myCart=await Cart.findOne({_id:req.user._id}).populate('cartItems.item');
		if (myCart) {
			const cartItems = [];
			myCart.cartItems.forEach((ele) => {
				const { item, itemQty } = ele;
				const data = {
					name: item.name,
					desc: item.desc,
					price: item.price,
					seller: item.seller,
					stock: item.stock,
					image: item.images[0].url,
					_id: item._id,
					rating: item.rating,
					qty: itemQty,
					status:item.status
				};
				cartItems.push(data);
			});
			res.status(200).json({ cartItems });
		} else {
			res.status(400).json({ error: "you don't have any item in cart" });
		}
	} catch (error) {
		res.status(400).json({ error: 'please login first to see your cart' });
	}
}
router.route('/removeFromCart/:id').delete(isAuthenticate, removeItem);
async function removeItem(req, res) {
	try {
		const _id=req.user._id;
		const cartItems = [];
		let myCart=await Cart.findByIdAndUpdate(_id,{$pull:{cartItems:{item:req.params.id}}},{new:true}).populate('cartItems.item')
		
		myCart.cartItems.forEach((ele) => {
			const { item, itemQty } = ele;
			const data = {
				name: item.name,
				desc: item.desc,
				price: item.price,
				seller: item.seller,
				stock: item.stock,
				image: item.images[0].url,
				_id: item._id,
				rating: item.rating,
				qty: itemQty
			};
			cartItems.push(data);
		});
		res.status(200).json({ cartItems });
	} catch (error) {
		res.status(400).json({ error: 'somthing went wrong' });
	}
}


module.exports = router;
