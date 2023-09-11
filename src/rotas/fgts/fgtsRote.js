const express = require('express');
const routesFgts = require('express').Router();
const config = require('../../config/config')
const axios = require('axios');
const { authSecret } = require("../../.config/.secret.js");
const jwt = require('jwt-simple')



// middleware para renovação do token
routesFgts.use(async (req, res, next) => {

    console.log('Checando token....')

    // Configurações da requisição
    const AxiosConfig = {
        headers: {
            'Authorization': config.basicAuthString
        }
    };
    const now = new Date();


    if (!config.token || config.expiration <= now) {

        console.log("Token expirado, gerando novo token....")

        // Realizar a requisição GET com o header
        const response = await axios.get(config.urlGetToken, AxiosConfig)
            .then(response => {

                console.log("Novo token gerado com sucesso")
                console.log(response.data); // Dados da resposta do sistema externo


                const expiration = new Date(now.getTime() + 3600 * 1000);


                config.token = `Bearer ${response.data.token}`
                config.expiration = expiration
                return next();

            })
            .catch(error => {

                console.error('Erro na requisição:', error);

                return res.send(error)
            });



    } else {
        console.log('token valido até ' + config.expiration)
        return next();
    }



})

routesFgts.post('/getTable', async (req, res) => {


    console.log('getTable')

    const dataTabelas = []
    const tabelas = [
        46205,
        46183,
        40789,
        40770,
        40762,
        40797,
        46230,
        46213,
        46191,
    ]

    const requestData_0 = JSON.stringify({
        cpf: req.body.params.cpf,
        //  tabela: 46205,
        //  taxa: 2.04,
        parcelas: req.body.params.parcelas
    });



    const headers = {
        'Authorization': config.token,
        'Content-Type': 'application/json'
    };

    for (let index = 0; index < tabelas.length; index++) {

        const requestData = JSON.stringify({
            cpf: req.body.params.cpf,
            tabela: tabelas[index],
            //  taxa: 2.04,
            parcelas: req.body.params.parcelas
        });

        await axios.post(config.urlGetTable, requestData, { headers: headers })
            .then(response => {
                console.log(response.data)
                return dataTabelas.push(response.data)
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                return dataTabelas.push(error)
            });

    }


    return res.send(dataTabelas)



})

routesFgts.post('/saldo', async (req, res) => {

    console.log('mid 2')

    const user = JSON.parse(req.body.id)
    try {
        
        const decoded = jwt.decode(user.token, authSecret)

    } catch (error) {

        const err = {
            erro: true,
            tipo: 'ERRO',
            msg: 'Não autorizado',
        }

        return res.send(err)
    }

    const params = {
        cpf: req.body.cpf
    };
    const headers = {
        'Authorization': config.token,
    };
    const configParans = {
        params,
        headers
    };

    axios.get(config.urlGetSaldo, configParans)
        .then(response => {
            console.log(response.data);
            return res.send(response.data)
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
            return res.send(error)
        });




})




module.exports = routesFgts;