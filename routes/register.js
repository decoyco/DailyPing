const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
// const initializePassport = require('../passport-config')
// const passport = require('passport')
// initializePassport(passport)

router.get('/', checkNotAuthenticated, (req,res) =>
{
    res.render('authenticate/register')
})

router.post('/', checkNotAuthenticated, async (req,res) =>
{
    try {
        const hashPassword = await bcrypt.hash(req.body.password, 10)
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashPassword,
            location: req.body.location
        })
        await user.save()
        res.redirect('/login')
    }
    catch(e){
        console.log(e)
        res.redirect('/register')
    }
})

function checkNotAuthenticated(req,res, next)
{
    if(req.isAuthenticated())
    {
        return res.redirect('/')
    }
    next()
}

module.exports = router