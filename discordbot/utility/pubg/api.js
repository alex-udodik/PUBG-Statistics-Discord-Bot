const fetch = require('node-fetch');
const APIError = require('../../errors/APIError')

module.exports = {


    fetchData: async function (url, timeout, payload) {

        const AbortController = globalThis.AbortController || await import('abort-controller')
        const controller = new AbortController();

        const timeout_ = setTimeout(() => {
            controller.abort();
        }, timeout);

        var getHeaders = function () {
            return {
                method: "POST",
                signal: controller.signal,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            }
        }

        const headers = getHeaders();
        return await fetch(url, headers)
            .then(res => {
                console.log("res: ", res);
                return res.json();
            }).then(body => {
                console.log("body: ", body);
                return body;
            }).catch(err => {
                console.log("error from api: ", err.type);
                clearTimeout(timeout_);
                return err;
            });
    }
}