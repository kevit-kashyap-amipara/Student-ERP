const mongoose = require("mongoose");
const bcrypt = require('bcryptjs')
require("dotenv").config();
const jwt = require('jsonwebtoken')

const superUser = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    unique:true,
    required: true,
  },
  token:[{
    tokens:{
        type:String,
        required:true,

    }
  }
]

});

superUser.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ email:user.email }, process.env.SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

const SuperUser = mongoose.model("SuperUser", superUser);

module.exports = SuperUser;
