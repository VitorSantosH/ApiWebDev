const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const mongoose = require('mongoose');
const http = require('http');
const https = require('https');
const app = express();
const logs = require('./rotas/saveLog')
const {routesUsers} = require("../src/rotas/newUser")
const config = require('./config/config')
const axios = require('axios')


/**
 * mongoose.connect('mongodb://localhost:27017/iplogs', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
 * 
 */


var certificade
try {
    certificade = {
        key: fs.readFileSync("/etc/letsencrypt/live/vitorwebdev.com.br/privkey.pem", 'utf8'),
        cert: fs.readFileSync("/etc/letsencrypt/live/vitorwebdev.com.br/fullchain.pem", 'utf8')
    };

} catch (error) {
    console.log(error)
}


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(logs.logIp);
app.use("/user", routesUsers)
app.use("/logs", logs.getLogs);
app.use('/deleteLogs', logs.deleteLogs)
app.use('/controler', express.static('dist'))
app.use('/fgts', express.static('dist'))
app.use('/', express.static('dist'))

// middleware para renovação do token
app.use(async (req, res, next) => {

    console.log('mid 1')

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

            })
            .catch(error => {

                console.error('Erro na requisição:', error);

                return res.send(error)
            });



    }

    next();

})

app.post('/fgts', async (req, res) => {


    console.log(req.body)

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





const portHttp = 8080;
const portHttpS = 8443
const httpsServer = https.createServer(certificade, app);
const httpServer = http.createServer(app);


httpServer.listen(portHttp, function () {
    console.log("JSON Server is running on " + portHttp);
});

try {
    httpsServer.listen(portHttpS, function () {
        console.log('Second site is running on port ' + portHttpS);
    });
} catch (error) {
    console.log(error)
}

