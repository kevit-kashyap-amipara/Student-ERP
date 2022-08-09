const jwt = require("jsonwebtoken");
const Superuser = require("../models/superuser");

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        const decoded = jwt.verify(token, process.env.SECRET);
        const user = await Superuser.findOne({ email: decoded.email, "tokens.token": token });

        if (!user)
            throw new Error()

        req.user = user;
        next();
    } catch (error) {
        res.status(401).send("Please authenticate");
    }
}

module.exports = auth;