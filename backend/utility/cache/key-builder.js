module.exports = {

    buildKey: function(params) {

        var key = [];
        params.forEach(arg => {
            key.push(`/${arg}`);
        })
        
        return key.join("");
    }
}