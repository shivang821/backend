const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'enter product name']
    },
    price: {
        type: Number,
        required: [true, "enter product price"]
    },
    stock: {
        type: Number,
        required: [true, "enter stock quantity"]
    },
    desc: {
        type: String,
        required: [true, 'enter product description']
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, 'enter seller id']
    },
    images: [{
        public_id: {
            type: String
        },
        url: {
            type: String
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: [{
        rating: {
            type: Number
        },
        review: {
            type: String
        },
        user:{
            id:{
                type:mongoose.Schema.ObjectId
            },
            name:{
                type:String
            }
        }
    }],
    category: {
        type: Array
    },
    status:{
        type:String,
        default:'exist'
    }
});
module.exports = new mongoose.model("Product", productSchema);