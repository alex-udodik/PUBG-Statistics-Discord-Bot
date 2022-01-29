const fetch = require('node-fetch');


module.exports = {


    fetchData: async function (url, timeout) {

        const AbortController = globalThis.AbortController || await import('abort-controller')
        const controller = new AbortController();

        const timeout_ = setTimeout(() => {
            controller.abort();
        }, timeout);

        var getHeaders = function () {
            return {
                method: "GET",
                signal: controller.signal,
                headers: {
                    'Authorization': `Bearer ${process.env.PUBG_API_KEY}`,
                    'Accept': 'application/vnd.api+json',
                }, 
            }
        }

        const headers = getHeaders();
        return await fetch(url, headers)
            .then(res => {
                return res.json();
            }).then(body => {
                return body;
            }).catch(err => {
                console.log("error from api: ", err.type);
                clearTimeout(timeout_);
                return err;
            });
    }
}