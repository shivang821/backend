const express = require('express')
const Product = require('../models/productModel')
const { isAuthenticate } = require('../utils/isAuthenticate')
const router = express.Router()
const cloudinary = require('cloudinary')
router.route('/create/product').post(isAuthenticate, createProduct)

async function createProduct(req, res) {
    try {
        let imagesArray = []
        if (typeof req.body.images === "string") {
            imagesArray.push(req.body.images)
        } else {
            imagesArray = req.body.images
        }
        const imagesLinks = []
        for (let i = 0; i < imagesArray.length; i++) {
            const result = await cloudinary.v2.uploader.upload(imagesArray[i], { folder: "products" })
            imagesLinks.push({ public_id: result.public_id, url: result.secure_url })
        }
        req.body.images = imagesLinks;
        req.body.seller = req.user._id;
        let { price, name, desc, stock, category, images, seller } = req.body
        const product = await Product.create({ price, name, desc, stock, category, images, seller });
        res.status(200).json({ product, success: true })
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
router.route('/product/:id').get(getProduct).patch(isAuthenticate, updateProduct).delete(isAuthenticate, deleteProduct)
async function getProduct(req, res) {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).json({ product })
    } catch (error) {
        res.status(400).json({ error: "somthing went wrong" })
    }
}
async function updateProduct(req, res) {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })

        res.status(200).json({ success: true, message: "product updated successfully", product })
    } catch (error) {
        res.status(400).json({ error: "somthing went wrong" })
    }
}
async function deleteProduct(req, res) {
    try {
        const product = await Product.findByIdAndDelete(req.params.id, { new: true })
        res.status(200).json({ message: 'product deleted successfully', success: true })
    } catch (error) {
        res.status.json({ error: 'somthing went wrong' })
    }
}
router.route('/product').get(getProducts)
async function getProducts(req, res) {
    try {
        let { sort, category } = req.query;
        if (sort === 'ascending') {
            sort = 1;
        } else if (sort === "descending") {
            sort = -1;
        }
        let products;
        if (sort) {
            products = category ? await Product.find({ category }).sort({ price: sort }) : await Product.find().sort({ price: sort })
        } else {
            products = category !== 'all' ? await Product.find({ category }) : await Product.find()
        }
        res.status(200).json({ products })

    } catch (error) {
        res.status(400).json({ error: "somthing  wrong" })
    }
}

module.exports = router;