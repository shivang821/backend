const express = require('express')
const Product = require('../models/productModel')
const { isAuthenticate, isAuthorize } = require('../utils/isAuthenticate')
const router = express.Router()
const cloudinary = require('cloudinary')
const Order = require('../models/orderModel')
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
router.route('/product/:id').get(getProduct).patch(isAuthenticate,isAuthorize, updateProduct).delete(isAuthenticate,isAuthorize, deleteProduct)
async function getProduct(req, res) {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).json( {product} )
    } catch (error) {
        res.status(400).json({ error: "somthing went wrong" })
    }
}
async function updateProduct(req, res) {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.status(200).json({ success: true, message: "product updated successfully" })
    } catch (error) {
        res.status(400).json({ error: "somthing went wrong" })
    }
}
async function deleteProduct(req, res) {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id,{status:'deleted'}, { new: true })
        res.status(200).json({ success: true })
    } catch (error) {
        res.status(400).json({ error: 'somthing went wrong' })
    }
}
router.route('/product').get(getProducts)
async function getProducts(req, res) {
    try {
        let {category,gt,lt,sort } = req.query;
        if(typeof(category)==='string'){
            let products;
            if (sort!=="0") {
                products = category!=='all'? await Product.find({$and:[{ category},{$and:[{price:{$gte:gt}},{price:{$lte:lt}}]},{status:'exist'}]}).sort({ price: sort }) : await Product.find({status:'exist'})
            } else {
                products = category !== 'all' ? await Product.find({$and:[{ category},{$and:[{price:{$gte:gt}},{price:{$lte:lt}}]},{status:'exist'}]}): 
                await Product.find({status:'exist'})
            }
            res.status(200).json({ products })
        }
        else{
            let products;
            if (sort!=="0") {
                products = await Product.find({$and:[{ category:{$in:category}},{$and:[{price:{$gte:gt}},{price:{$lte:lt}}]},{status:'exist'}]}).sort({ price: sort }) 
            } else {
                products = await Product.find({$and:[{ category:{$in:category}},{$and:[{price:{$gte:gt}},{price:{$lte:lt}}]},{status:'exist'}]})
            }
            res.status(200).json({ products })
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "somthing  wrong" })
    }
}
// router.route('/sendProductme').get(sendMe)
// async function sendMe(req,res){
//     try {
//         const {category}=req.query;
//         console.log(typeof(category));
//         const product=await Product.find({category:{$in:category}})
//         res.status(200).json({product})
//     } catch (error) {
//         console.log(error);
//         res.status(400).json({error:'something went wrong'})
//     }
// }
router.route('/search-result').get(sendSearchResults)
async function sendSearchResults(req,res){
    try {
        const {keyword,lt,gt,sort}=req.query;
        let products;
        if(sort==="0"){
            products=await Product.find({$and:[{$or:[{name:{$regex:`.*${keyword}.*`,$options:'i'}},{category:{$regex:`.*${keyword}.*`,$options:'i'}}]},{$and:[{price:{$gte:gt}},{price:{$lte:lt}}]},{status:'exist'}]})
        }
        else{
            products=await Product.find({$and:[{$or:[{name:{$regex:`.*${keyword}.*`,$options:'i'}},{category:{$regex:`.*${keyword}.*`,$options:'i'}}]},{$and:[{price:{$gte:gt}},{price:{$lte:lt}}]},{status:'exist'}]}).sort({price:sort})
        }
        res.status(200).json({products})
    } catch (error) {
        console.log(error);
        res.status(404).json({error:'somthing went wrong'})
    }
}
router.route('/adminItems').get(isAuthenticate,isAuthorize,sendSellerProduct)
async function sendSellerProduct(req,res){
    try {
        const products= await Product.find({seller:req.user._id,status:'exist'})
        let orders=await Order.find({seller:req.user._id}).populate('product')
        orders=orders.filter((item)=>{
            return item.product.status==='exist'
        })

        res.status(200).json({products,orders})
    } catch (error) {
        res.status(400).json({error:'somthing went wrong'})
    }
}

router.route('/submit-review/:id').patch(isAuthenticate,submitReview);
async function submitReview(req,res){
    try {
        const {rating,review}=req.body;
        let productReview={rating,review,user:{id:req.user._id,name:req.user.name}};
        let product=await Product.findByIdAndUpdate({_id:req.params.id})
        product.reviews=product.reviews.filter((item)=>{
            if(!item.user.id.equals(req.user._id)){
                return item
            }
        })
        product.reviews.push(productReview);
        let productRating=0;
        product.reviews.forEach((item)=>{
            productRating+=item.rating;
        })
        let numberOfReviews=product.reviews.length;
        product.rating=productRating/numberOfReviews;
        product=await product.save()
        res.status(200).json({product})

    } catch (error) {
        res.status(404).json({error:'somthing went wrong'})
    }
}
module.exports = router;