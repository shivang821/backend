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
    },
    paymentDetails:{
        razorpay_payment_id:{
            type:String
        },
        razorpay_order_id:{
            type:String
        },
        razorpay_signature:{
            type:String
        }
    },
    shippingDetail:{
		country:{
			type:String
		},
		state:{
			type:String
		},
		district:{
			type:String
		},
		city:{
			type:String
		},
		address:{
			type:String
		},
		contact:{
			type:Number
		}
    }
})

module.exports = new mongoose.model("Order", orderSchema)