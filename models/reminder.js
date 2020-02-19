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
        type: String,
        required: true
    },
    utc_time:
    {
        type: Number,
        required: true
    },
    conditions:
    {
        type: String
    },
    rain:
    {
        type: Boolean,
        required: true
    },
    wind:
    {
        type: Boolean,
        required: true
    },
    clouds:
    {
        type: Boolean,
        required: true
    },
    clear:
    {
        type: Boolean,
        required: true
    },
    snow:
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