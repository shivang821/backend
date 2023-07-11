const dotenv = require('dotenv')
const express = require('express')
dotenv.config({ path: './config.env' })
const cookieParser = require('cookie-parser')
const cors = require('cors')
const bodyParser = require('body-parser')
const userRoute = require('./routes/userRoutes')
const productRoute = require('./routes/productRoute')
const app = express()
const orderRoute = require('./routes/orderRoute')
const cloudinary = require('cloudinary')
const fileUpload = require('express-fileupload')
const Razorpay=require('razorpay')
require('./database/conn')
app.use(express.json({ limit: '50mb' }))
app.use(fileUpload())
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(cookieParser())
app.use(productRoute)
app.use(userRoute)
app.use(orderRoute)
app.use(cors({
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true
    }))
    // app.use(cors())
 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})
// app.use(express.static('dist'))
app.listen(4000, (req, res) => {
    console.log("server is running on port 4000");
})