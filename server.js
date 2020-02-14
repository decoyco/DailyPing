if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

//import libraries
const express = require('express')
const flash = require('express-flash')
const session = require('express-session')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const User = require('./models/user')
const bodyParser = require('body-parser')
const passport = require('passport')


//import routes
const registerRouter = require('./routes/register')
const loginRouter = require('./routes/login')
const userRouter = require('./routes/user')

//setup views
app.set('view engine', 'ejs')
app.use(flash())
app.use(session( {
    secret: process.env["SESSION_SECRET"],
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false}))
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
app.use('/', userRouter)
app.use('/login', loginRouter)
app.use('/register', registerRouter)

app.listen(process.env.PORT || 3000)