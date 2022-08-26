const fetch = require('node-fetch');
const APIError = require('../errors/APIError')

module.exports = {


    fetchData: async function (url, timeout, payload, method) {

        const AbortController = globalThis.AbortController || await import('abort-controller')
        const controller = new AbortController();

        const timeout_ = setTimeout(() => {
            controller.abort();
        }, timeout);

        var getHeaders = function () {
            var header = {
                method: method,
                signal: controller.signal,
                headers: {'Content-Type': 'application/json'},
            }

            if (payload !== null) {header.body = JSON.stringify(payload)}
            return header;
        }

        const headers = getHeaders();
        return await fetch(url, headers)
            .then(res => {
                return res.json();
            }).then(body => {
                return body;
            }).catch(err => {
                console.log("error from routes: ", err.type);
                clearTimeout(timeout_);
                return err;
            });
    }
}