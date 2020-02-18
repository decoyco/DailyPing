const express = require('express')
const router = express.Router()
const Reminder = require('../models/reminder')

router.delete('/:id', checkAuthenticated, async (req,res) =>
{
    try
    {
        const reminder = await Reminder.findById(req.params.id);
        await reminder.remove()
        res.redirect('/')
    }
    catch(e)
    {
        const reminders = await Reminder.find({associatedUserId: req.user})
        res.render('index', {user: req.user, reminders: reminders, errorMessage: `Error Deleting Reminder`})
    }
})

router.put('/:id/enable', async (req,res) => 
{
    try
    {
        const reminder = await Reminder.findById(req.params.id)
        reminder.enabled = !reminder.enabled
        await reminder.save()
        res.redirect('/')
    }
    catch
    {
        const reminders = await Reminder.find({associatedUserId: req.user})
        res.render('user/index', {reminders: reminders, user:req.user, errorMessage: `Error toggling enable`})
    }
    
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