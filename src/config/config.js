const credentials = "93772:7jwxtuhtbzd3ho6iis0t"
const base64Credentials = Buffer.from(credentials).toString('base64')

config = {
    basicAuthString: `Basic ${base64Credentials}`,
    token: undefined,
    expiration: undefined,
    urlGetToken: 'https://webservice-homol.facta.com.br/gera-token',
    urlGetSaldo: "https://webservice-homol.facta.com.br/fgts/saldo",
}

/**
 * // url facta
const url = 'https://webservice-homol.facta.com.br/gera-token';
 */


module.exports = config