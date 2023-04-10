const dotenv = require('dotenv')
const express = require('express')
dotenv.config({ path: './config.env' })
const cookieParser = require('cookie-parser')
const cors = require('cors')
const bodyParser = require('body-parser')
const userRoute = require('./routes/userRoutes')
const productRoute = require('./routes/productRoute')
const app = express()
const testRoute = require('./routes/test')
const orderRoute = require('./routes/orderRoute')
require('./database/conn')
app.use(express.json())
app.use(cookieParser())
app.use(userRoute)
app.use(testRoute)
app.use(productRoute)
app.use(orderRoute)
    // app.use(cors({
    //         origin: 'http://localhost:5173',
    //         methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    //         credentials: true
    //     }))
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))

app.get('/', (req, res) => {
    res.send('hello ')
})
app.listen(4000, (req, res) => {
    console.log("server is running on port 4000");
})