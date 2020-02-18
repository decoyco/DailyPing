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
      user: process.env.EMAIL,
      pass: process.env.Email_PASSWORD
    }
  });
const weather = require('openweather-apis')
weather.setLang('en')
weather.setAPPID(process.env.OWM_API)
weather.setUnits('metric')


//import routes
const registerRouter = require('./routes/register')
const loginRouter = require('./routes/login')
const userRouter = require('./routes/user')
const reminderRouter = require('./routes/reminder')

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
app.use('/reminder', reminderRouter)

//60000
setInterval(sendReminder, 60000)
async function sendReminder()
{
    try
    {
        const d = new Date(Date.now())
        const date_to_time = d.toUTCString().split(' ')[4]
        const _date_to_time = date_to_time.split(':')
        const time_now = _date_to_time[0] + '' + _date_to_time[1]
        //CHECK TIME AND ENABLED
        let query = await Reminder.find({utc_time: time_now, enabled: true}).exec()
        query.forEach(reminder => 
        {
          console.log("reminder found: " + reminder.message)
          var rainy = false, windy = false, cloudy = false, clear = false, snow = false
          var temperatureMatch = false
          var temp_greaterThan = false
          var temp_testValue = 0
          if(reminder.temperature)
          {
            const words = reminder.temperature_condition.split(' ')
            if(words[0] == ">")
              temp_greaterThan = true
            temp_testValue = words[1]
          }
          weather.setCity(reminder.location)
          weather.getAllWeather(function(err, currentWeather)
          {
            if(err)
            {
              console.log(err)
            }
            else
            {
              if(currentWeather.weather[0].id >= 801)
              {
                cloudy = true
              }
              else if (currentWeather.weather[0].id == 800)
              {
                clear = true
              }
              else if (currentWeather.weather[0].id >= 600 && currentWeather.weather[0].id <= 622)
              {
                snow = true
              }
              else if ((currentWeather.weather[0].id >= 500 && currentWeather.weather[0].id <= 531) || (currentWeather.weather[0].id >= 300 && currentWeather.weather[0].id <= 321) || (currentWeather.weather[0].id >= 200 || currentWeather.weather[0].id <= 232))
              {
                rainy = true
              }
              if(currentWeather.wind.speed > 11)
              {
                windy = true
              }
              if(reminder.temperature)
              {
                if(temp_greaterThan)
                {
                  if(currentWeather.main.temp > temp_testValue)
                  {
                    temperatureMatch = true
                  }
                }
                else
                {
                  if(currentWeather.main.temp < temp_testValue)
                  {
                    temperatureMatch = true
                  }
                }
              }
            }
            if((reminder.rainy && rainy) || (reminder.windy && windy) || (reminder.cloudy && cloudy) || (reminder.clear && clear) || /* (reminder.snow && snow) ||*/ temperatureMatch)
            {
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
            }
          })
      })
  }
  catch(e)
  {
      console.log(e)
  }
}
app.listen(process.env.PORT || 3000)