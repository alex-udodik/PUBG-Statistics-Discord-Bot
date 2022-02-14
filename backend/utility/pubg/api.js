const fetch = require('node-fetch');
const APIError = require('../../errors/APIError')

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
                if (res.status === 429) {
                    console.log("API Response Status: ", res.status);
                    throw new APIError("Too many requests to PUBG API");
                }

                return res.json();
            }).then(body => {
                return body;
            }).catch(err => {
                console.log(`Error fetching from PUBG API: ${err.type}`);
                clearTimeout(timeout_);
                throw new APIError(`Error fetching from PUBG API: ${err.type}`);
            });
    }
}