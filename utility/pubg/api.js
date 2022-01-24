const fetch = require('node-fetch');

module.exports = {

    fetchData: async function (url) {

        const headers = getHeaders();
        return await fetch(url, headers)
            .then(res => {
                return res.json();
            }).then(body => {
                return body;
            }).catch(err => {
                return err;
            });
    }
}

var getHeaders = function () {
    return {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${process.env.PUBG_API_KEY}`,
            'Accept': 'application/vnd.api+json',
        }
    }
}