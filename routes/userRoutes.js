const express = require('express')
const router = express.Router();
const User = require('../models/userModel')
const sendToken = require('../utils/sendToken')
const { isAuthenticate } = require('../utils/isAuthenticate')
router.route('/signup').post(signupUser)
async function signupUser(req, res) {
    try {
        const { email, name, password } = req.body
        let user = await User.findOne({ email });
        console.log(user);
        if (user) {
            return res.status(400).json({ error: "user already exist" })
        }
        user = await User.create({ email, name, password })
        sendToken(user, res, "user registerd")
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
router.route('/login').post(loginUser)
async function loginUser(req, res) {
    try {
        console.log('hello');
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "please fill email and password correctly" })
        }
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: "user not found" })
        }
        const isMatch = await user.comparePassword(password);
        if (isMatch) {
            sendToken(user, res, "user loged in successfully")
        } else {
            return res.status(400).json({ error: 'invalid details' })
        }
    } catch (error) {
        res.status(400).json({ error: "somthing went wrong" })
    }
}
router.route('/logout').get(logOutUser);

async function logOutUser(req, res) {
    try {
        res.cookie('token', null, { expires: new Date(Date.now()), httpOnly: true })
        res.status(200).json({ success: true, message: "user logged out" })
    } catch (error) {
        res.status(400).json({ error: 'somthing went wrong' })
    }
}
router.route('/me').get(isAuthenticate, sendUser)
async function sendUser(req, res) {
    try {
        res.status(200).json({ user: req.user });
    } catch (error) {
        res.status(400).json({ error: 'somthing went wrong' })
    }
}
router.route('/makemeseller').patch(isAuthenticate, updateMe)
async function updateMe(req, res) {
    try {
        let user = await User.findByIdAndUpdate(req.user._id, { role: 'seller', pan: req.body.pan }, { new: true })
        console.log(user);
        res.status(200).json({ user })
    } catch (error) {
        res.status(400).json({ error: 'somthing went wrong' })
    }
}
router.route('/addToCart/:id').post(isAuthenticate,AddToCart)
async function AddToCart(req,res){
    try {
        const {items}=req.body;
        let user= await User.find(req.user._id);
        user.cartItems=items;
        user.save();
    } catch (error) {
        res.status(400).json({error:"Somthing went wrong"})
    }
}
module.exports = router