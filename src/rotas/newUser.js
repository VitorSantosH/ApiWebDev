const mongoose = require('mongoose');
const userSchema = require('../models/userSchema');
const conn = require('../.config/config.js');
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple')
const routesUsers = require('express').Router();
const Users = conn.model('User', userSchema);
const {authSecret} = require('../.config/.secret.js')



const generateUser = async (req, res, next) => {

    const salt = await bcrypt.genSalt(10);
    const email = req.body.email;
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const UserAlreadyExists = await Users.findOne({ email: email })

    if (!UserAlreadyExists) {
        const newUser = await Users.create({
            email: email,
            password: hashedPassword,
            role: req.body.role,
        })
        return res.send(newUser)
    } else {

        return res.send("Usuário já existe!")
    }


}

const getUsers = async (req, res, next) => {

    const users = await Users.find({})
    return res.send(users)
}

const signin = async (req, res) => {

    if (!req.body.email || !req.body.password) {
        return res.status(400).send("Informe o usuário e password!")
    }


    var usuario = await Users.findOne({ email: req.body.email }).lean().then((user) => {

        return user
    })


    if (!usuario) {
        return res.status(400).send("Usuário inválido")
    }


    const isMatch = await bcrypt.compare(req.body.password, usuario.password)

    if (!isMatch) return res.status(401).send("Email/password inválidos")

    const now = Math.floor(Date.now() / 1000)
    const payload = {
        id: usuario._id,
        name: usuario.nome,
        iat: now,
        exp: now + (60 * 60 * 24 * 3)
    }

  

    return res.json({
        ...payload,
        token: await jwt.encode(payload, authSecret)
    })

}

routesUsers.post("/generateUser", generateUser)
routesUsers.post('/login', signin);
routesUsers.get('/', getUsers);




module.exports = {routesUsers, Users};