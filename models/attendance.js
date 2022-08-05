const mongoose = require("mongoose");

const attendance = mongoose.Schema({
  date: {
    type: String,
    required: true,
  },

  rollno: {
    type: String,
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
  },
});
const Attendance = mongoose.model("Attendance", attendance);

module.exports = Attendance;
