const mongoose=require('mongoose')

const cartSchema=mongoose.Schema({
    _id: {
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    cartItems:[
        {
            item:{
                type: mongoose.Schema.ObjectId,
                ref:'Product'
            },
            itemQty:{
                type:Number
            }
        }
    ]
})

module.exports=new mongoose.model("Cart",cartSchema)