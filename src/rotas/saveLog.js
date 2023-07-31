const mongoose = require('mongoose');
const saveIpMongo = require("../models/schemaLog.js");
const conn = require('../.config/config.js');
const jwt = require('jwt-simple');
const { Users } = require('./newUser.js');
const { authSecret } = require('../.config/.secret.js');
const { response } = require('express');

const saveIps = conn.model('iplogs', saveIpMongo);

const logs = {


    logIp: async (req, res, next) => {

        try {

            const host = req.headers.host
            const ipAdress = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            let IpMongo
            const logExists = await saveIps.findOne({ ipAdress: ipAdress });

            if (logExists) {
                console.log(logExists)

                logExists.count++
                logExists.save()
                    .then(res => {
                        console.log(res)
                    })
                    .catch(err => {
                        console.log(err)
                    })

            } else {

                IpMongo = await saveIps.create({
                    ipAdress: ipAdress,
                    host: host,
                    count: 1
                })

            }



        } catch (error) {
            console.log(error)
        }

        next();
    },

    getLogs: async (req, res, next) => {

        // verifica o autorization (jwt do user enviado ao front ao realizar o login) e se for "admin" libera os logs


        if (!req.headers.authorization) {
            return res.send("Requisição incorreta")
        }

        const auth = jwt.decode(req.headers.authorization, authSecret);
        const autorizationLevel = await Users.findOne({ _id: auth.id });

        if (autorizationLevel.role !== "admin") {
            return res.send("Usuário não autorizado")
        }

        try {
            const logs = await saveIps.find({});

            return res.send(logs);
        } catch (error) {
            return res.status(500).send('Erro ao consultar o banco de dados: ' + error.message);
        }

    },

    deleteLogs: async (req, res, next) => {

        console.log(req.headers)

        if (!req.headers.authorization) {
            return res.send("Requisição incorreta")
        }

        const auth = jwt.decode(req.headers.authorization, authSecret);
        const autorizationLevel = await Users.findOne({ _id: auth.id });

        if (autorizationLevel.role !== "admin") {
            return res.send("Usuário não autorizado")
        }

        const response = await saveIps.deleteMany({}).then(returnDelete => {
            return res.send({ returnDelete })
        })
        .catch(err => {
            return res.send({err})
        })

    }
}






module.exports = logs;