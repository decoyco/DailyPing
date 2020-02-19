const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Reminder = require('../models/reminder')
var moment = require('moment')
moment().format();
const weather = require('openweather-apis')
weather.setLang('en')
weather.setAPPID('c2827fcb20faeea22f693363ce34f18d')
weather.setUnits('metric')

router.get('/', checkAuthenticated, async (req,res) =>
{
    let reminders = await Reminder.find({email: req.user.email})
    res.render('user/index', 
    {
        user: req.user,
        reminders: reminders
    })
})

router.get('/edit', checkAuthenticated, (req,res) =>
{
    res.render('user/edit', {user: req.user})
})

router.put('/edit', checkAuthenticated, async (req,res) =>
{
    try
    {
        const user = await User.findById(req.user)
        user.email = req.body.email
        user.name = req.body.name
        user.location = req.body.location
        await user.save()
        res.redirect('/')
    }
    catch
    {
        res.render('user/edit', {user: req.user, errorMessage: `Error Editing Profile`})
    }
})

router.delete('/logout',(req, res) =>
{
    req.logOut()
    res.redirect('/login')
})

router.post('/',checkAuthenticated, async (req,res) =>
{
    var time = req.body.time.split(':')
    const hour = time[0]
    const minute = time[1]
    const _time = (hour > 12 ? hour-12 : hour) + ':' + minute + (hour > 12 ? 'PM' : 'AM')
    //console.log("input time: " + req.body.time)
    weather.setCity(req.user.location)
    weather.getAllWeather(async function(err, currentWeather)
    {
        var utc_time = new moment('2020-02-17 ' +req.body.time+":00").utcOffset(-currentWeather.timezone/3600)
        // console.log(currentWeather.timezone)
        // console.log(utc_time.format())
        // console.log(utc_time.utc().format())
        //const hour = utc_time.utc().hours() >= 10 ? utc_time.utc().hours() : '0'+utc_time.utc().hours()
        //const minute = utc_time.utc().minutes() >= 10 ? utc_time.utc().minutes() : '0'+utc_time.utc().minutes()
        //const _utc_time = hour + '' + minute;
        const hour = utc_time.hours() >= 10 ? utc_time.hours() : '0'+utc_time.hours()
        const minute = utc_time.minutes() >= 10 ? utc_time.minutes() : '0'+utc_time.minutes()
        const _utc_time = hour + '' + minute;
        //console.log(_utc_time)
        const temp_compare = req.body.temp_compare == "greaterThan" ? ">" : "<"
        const _value = parseFloat(req.body.temp_value)
        const temp_value = req.body.temp_type == "F" ? (_value - 32) / 1.8 : _value
        const temperature_condition = temp_compare + ' ' + temp_value.toFixed(2)
        var conditions = ""
        const rainy = req.body.rainy == "on" ? true : false
        if(rainy){ conditions += "Rain, "}
        const windy = req.body.windy == "on" ? true : false
        if(windy) {conditions += "Wind, "}
        const cloudy = req.body.cloudy == "on" ? true : false
        if(cloudy) {conditions += "Clouds, "}
        const clear = req.body.clear == "on" ? true : false
        if(clear) {conditions += "Clear, "}
        const temperature = req.body.temperature == "on" ? true : false
        if(temperature) {conditions += "Temperature " + temp_compare + " " + req.body.temp_value + req.body.temp_type}
        const enabled = req.body.enabled == "on" ? true : false
        const reminder = new Reminder(
        {
            message: req.body.message,
            time: _time,
            utc_time: _utc_time,
            conditions: conditions,
            rainy: rainy,
            windy: windy,
            cloudy: cloudy,
            clear: clear,
            temperature: temperature,
            temperature_condition: temperature_condition,
            enabled: enabled,
            location: req.user.location,
            associatedUserId: req.user.id,
            email: req.user.email
        })
        try
        {
            await reminder.save()
            res.redirect('/')
        }
        catch(e)
        {
            console.log(e)
            let reminders = await Reminder.find({email: req.user.email})
            res.render('user/index', {user: req.user, errorMessage: `Error adding reminder`, reminders: reminders})
        }
    })
})

function checkAuthenticated(req,res,next)
{
    if(req.isAuthenticated())
    {
        return next()
    }
    res.redirect('/login')
}

module.exports = router