const express = require('express');
const routesFgts = require('express').Router();
const config = require('../../config/config')
const axios = require('axios');



// middleware para renovação do token
routesFgts.use(async (req, res, next) => {

    console.log('Gerando token....')

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


                const expiration = new Date(now.getTime() + 36000 * 1000);


                config.token = `Bearer ${response.data.token}`
                config.expiration = expiration

            })
            .catch(error => {

                console.error('Erro na requisição:', error);

                return res.send(error)
            });



    }

    next();

})

routesFgts.post('/getTable', async (req, res) => {


    console.log('getTable')

    const requestData = JSON.stringify({
        cpf: req.body.params.cpf,
        tabela: 46205,
      //  taxa: 2.04,
        parcelas: req.body.params.parcelas
    });

  

    const headers = {
        'Authorization': config.token,
        'Content-Type': 'application/json'
    };


    axios.post(config.urlGetTable, requestData, { headers: headers })
        .then(response => {
            console.log(response.data);
            return res.send(response.data)
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
            return res.send(error)
        });

})

routesFgts.post('/saldo', async (req, res) => {

    console.log('mid 2')

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