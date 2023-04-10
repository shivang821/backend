const { isAuthenticate } = require("../utils/isAuthenticate")
const express = require('express')
const router = express.Router();
const User = require('../models/userModel')
router.route('/test').get(isAuthenticate, testFunc)

async function testFunc(req, res) {
    try {
        // const user = await User.findById(req.user._id)
        res.status(200).json({ user: req.user })

    } catch (error) {
        console.log(error);
    }
}
module.exports = router;