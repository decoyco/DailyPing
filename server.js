if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

//import libraries
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')

//import routes
const authorizeRouter = require('./routes/authorize')
const userRouter = require('./routes/user')

//setup views
app.set('view engine'. ejs)
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(methodOverride('_method'))

//Setup mongoose server
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

//setup routers
app.use('/', authorizeRouter)
app.use('/user', userRouter)

app.listen(process.env.PORT || 3000)