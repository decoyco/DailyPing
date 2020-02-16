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
const Reminder = require('./models/reminder')
const bodyParser = require('body-parser')
const passport = require('passport')
const nodemailer = require('nodemailer')
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'dailyping.noreply@gmail.com',
      pass: 'hitmanr3b0rn'
    }
  });


//import routes
const registerRouter = require('./routes/register')
const loginRouter = require('./routes/login')
const userRouter = require('./routes/user')
//const reminderRouter = require('./routes/reminder')

//setup views
app.set('view engine', 'ejs')
app.use(flash())
app.use(session( {
    secret: process.env.SESSION_SECRET,
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
//app.use('/reminder', reminderRouter)


setInterval(sendReminder, 60000)
async function sendReminder()
{
    let request = require('request');
    const apiKey = 'c2827fcb20faeea22f693363ce34f18d'
    try
    {
        const d = new Date(Date.now())
        const minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()
        const time_now = d.getHours() + '' + minutes;
        let query = await Reminder.find({time: time_now, enabled: true}).exec()
        query.forEach(reminder => {
            let url = `http://api.openweathermap.org/data/2.5/weather?q=${reminder.location}&units=imperial&appid=${apiKey}`
            const rainy, windy, cloudy, clear, temperature
            request(url, function (err, response, body) {
                if(err){
                  console.log('error:', error);
                } else {
                  let weather = JSON.parse(body)
                  //USE weather TO TEST FOR CONDITIONS HERE!
                }
              });
            transporter.sendMail({
                from: 'dailyping.noreply@gmail.com',
                to: reminder.email,
                subject: 'Your DailyPing Reminder!',
                text: reminder.message
            }, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
        });
    }
    catch(e)
    {
        console.log(e)
    }
}
app.listen(process.env.PORT || 3000)