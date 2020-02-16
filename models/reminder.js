const mongoose = require('mongoose')

const reminderSchema = new mongoose.Schema(
{
    message:
    {
        type: String,
        required: true
    },
    time:
    {
        type: Number,
        required: true
    },
    rainy:
    {
        type: Boolean,
        required: true
    },
    windy:
    {
        type: Boolean,
        required: true
    },
    cloudy:
    {
        type: Boolean,
        required: true
    },
    clear:
    {
        type: Boolean,
        required: true
    },
    temperature:
    {
        type: Boolean,
        required: true
    },
    temperature_condition:
    {
        type: String,
        required: false
    },
    enabled:
    {
        type: Boolean,
        required: true
    },
    location:
    {
        type: String,
        required: true
    },
    associatedUserId:
    {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Reminder', reminderSchema)