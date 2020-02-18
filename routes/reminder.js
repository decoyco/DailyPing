const express = require('express')
const router = express.Router()
const Reminder = require('../models/reminder')

router.delete('/:id', async (req,res) =>
{
    try
    {
        const reminder = await Reminder.findById(req.params.id);
        await reminder.remove()
        res.redirect('/')
    }
    catch(e)
    {
        const reminders = await Reminder.find({})
        res.render('index', {user: req.user, reminders: reminders, errorMessage: `Error Deleting Reminder`})
    }
})

module.exports = router