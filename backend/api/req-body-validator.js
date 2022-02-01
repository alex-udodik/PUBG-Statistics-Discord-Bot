
module.exports = {
    validateJSON: function(body) {
        if ("names" in body) {
            if (Object.prototype.toString.call(body.names) === '[object Array]') {
                if (body.names.length > 0) { return true; }
            }
        }
        return false;
    }
}

