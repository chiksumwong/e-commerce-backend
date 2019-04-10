const config = require('./../config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('./../models/user.model')

module.exports = {
    register,
    login,
    getById
};

async function login(req, res, next) {
    let email = req.body.email;
    let password = req.body.password;

    const user = await User.findOne({ email:email });

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ sub: user.id }, config.JWT_SECRET_KEY);
        return res.status(200).json({ user_id:user.id, token: token });
    }
    next();
}

async function register(req, res, next) {
    let hash_password;
    if (req.body.password) {
        hash_password = bcrypt.hashSync(password, 10);
    }
    let user = {
        username: req.body.username,
        password: hash_password,
        email: req.body.email
    }
    const user = new User(user);
    await user.save((err, user) => {
        if (err) return res.status(500).json({error_message:err});
        return res.status(200).json(user);
    });
}

async function getById(req, res, next) {
    await User.findById(req.params.id, (err, user) =>{
        if (err) return res.status(500).json({error_message:err});
        return res.status(200).json(user);
    });
}