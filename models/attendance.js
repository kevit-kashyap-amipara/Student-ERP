const mongoose = require('mongoose');

const attendance = mongoose.Schema({
    date: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    rollno: {
        type: String,
        required: true,
        

    },
    batch: {
        type: Number,
        required: true,

    },
    branch: {
        type: String,
        required: true,

    },
    sem: {
        type: Number,
        required: true,

    },
    present: {
        type: Boolean,
       
        default: true,
    },
    totalDays: {
        type: Number,
    },
    presentCount: {
        type: Number,
    },
    attendance: {
        type: Number,
    }

})
const Attendance = mongoose.model('Attendance', attendance)

module.exports = Attendance;