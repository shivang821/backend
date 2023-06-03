const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "email is required"]
    },
    password: {
        type: String,
        required: [true, 'password is required']
    },
    role: {
        type: String,
        default: "user"
    },
    avatar: {
        public_id: {
            type: String,
        },
        url: {
            type: String
        }
    },
    pan: {
        type: String
    },
    cartItems:[
        {
            pid:{
                type: mongoose.Schema.ObjectId,
                ref:'Product'
            }
        }
    ]
    
})
userSchema.pre('save', async function(next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
})
userSchema.methods.comparePassword = async function(currPassword) {
    return await bcrypt.compare(currPassword, this.password)
}
userSchema.methods.getJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET)
}
module.exports = new mongoose.model("User", userSchema);