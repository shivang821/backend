const express = require('express')
const router = express.Router();
const User = require('../models/userModel')
const sendToken = require('../utils/sendToken')
router.route('/signup').post(signupUser)
async function signupUser(req, res) {
    try {
        const { email, name, password, role } = req.body
        let user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ message: "user already exist" })
        }
        const avatar = {
            public_id: "sample id",
            url: "samble url"
        }
        user = await User.create({ email, name, password, role, avatar })
            // res.status(200).json({ user, message: "user registerd" })
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
            // return res.status(200).json({ message: "user loged in successfully" })
            sendToken(user, res, "user loged in successfully")
        } else {
            return res.status(400).json({ error: 'invalid details' })
        }
    } catch (error) {
        res.status(400).json({ error: "somthing went wrong" })
    }
}
module.exports = router