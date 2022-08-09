const mongoose = require("mongoose");

const student = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rollno: {
    type: String,
    unique:true,
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
  phoneNumber:{
    type:String,
    required:true,
  }
   
  
});
const Student = mongoose.model("Student", student);

module.exports = Student;