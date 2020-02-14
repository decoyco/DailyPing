const express = require('express')
const router = express.Router()
// const passport = require('passport')
// const initializePassport = require('../passport-config')
// initializePassport(passport)

router.get('/', checkAuthenticated, (req,res) =>
{
    res.render('index')
})

router.delete('/logout',(req, res) =>
{
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req,res,next)
{
    if(req.isAuthenticated())
    {
        console.log("Logged in")
        return next()
    }
    res.redirect('/login')
}

module.exports = router