const express = require('express')
const router = express.Router()
const passport = require('passport')
const initializePassport = require('../passport-config')
initializePassport(passport)

router.get('/', checkNotAuthenticated, (req,res) =>
{
    res.render('authenticate/login.ejs')
})

router.post('/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedicrect: 'login',
    failureFlash: true
}))

function checkNotAuthenticated(req,res, next)
{
    if(req.isAuthenticated())
    {
        return res.redirect('/')
    }
    next()
}


module.exports = router