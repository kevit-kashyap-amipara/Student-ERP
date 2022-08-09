const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const superUserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        minlength: 8,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

superUserSchema.statics.findByCredentials = async (email, password) => {
    const user = await Superuser.findOne({ email });
    if (!user)
        throw new Error("Invalid Credentials");
    const authorized = await bcrypt.compare(password, user.password);
    if (!authorized)
        throw new Error("Invalid Credentials");
    return user;
}

superUserSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ email: user.email }, process.env.SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
}

const Superuser = mongoose.model("Superuser", superUserSchema);
module.exports = Superuser;