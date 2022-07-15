const mongoose = require('mongoose');

const info = mongoose.Schema({
    batch: {
        type: Number,
        required: true,
    },
    branches: [
        {
            branchName: {
                type: String,
                required: true,
            },
            totalStudents: {
                type: Number,
                required: true,
            },
            totalStudentsIntake: {
                type: Number,
                required: true,
            }
        }
    ]
})
const Info = mongoose.model('Info', info)

module.exports = Info;