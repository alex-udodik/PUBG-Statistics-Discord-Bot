module.exports = {
    validateJSON: function(body) {

        var response = {
            statusCode: "",
            message: ""
        }

        //TODO: make it so that each object within the body is checked and validated.
        //      return a response object with a statuscode and message if there is an issue
        //      otherwise return true
        if ("names" in body) {
            if (Object.prototype.toString.call(body.names) === '[object Array]') {
                if (body.names.length > 0) { 
                    return true;/*
                    if ("unranked" in body) {
                        if ("season" in body.unranked) {

                        }
                    } */
                }
            }
        }
        return false;
    }
}

