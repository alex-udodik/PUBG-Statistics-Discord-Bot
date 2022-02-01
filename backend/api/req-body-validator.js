module.exports = {
    validateJSON: function (body) {

        var response = {
            statusCode: "",
            message: ""
        }

        //TODO: make it so that each object within the body is checked and validated.
        //      return a response object with a statuscode and message if there is an issue
        //      otherwise return true
        response.statusCode = 400;
        if (!("names" in body)) {
            response.message = 'Missing "names": [] in body.';
            return response;
        }
        if (Object.prototype.toString.call(body.names) !== '[object Array]') {
            response.message = '"names" requires an array as its value.';
            return response;
        }
        if (body.names.length === 0) {
            response.message = '"names" cannot be an empty array.';
            return response;
        }
        if (!("type" in body)) {
            response.message = 'Missing "type" in body.';
            return response;
        }
        if (!("ranked" in body.type)) {
            response.message = 'Missing "ranked" in body.type';
            return response;
        }
        if (Object.prototype.toString.call(body.type.ranked) !== '[object Boolean]') {
            response.message = 'body.type.ranked requires a boolean value.';
            return response;
        }
        if (!("season" in body.type)) {
            response.message = 'Missing "season" in body.type.';
            return response;
        }
        if (Object.prototype.toString.call(body.type.season) !== '[object String]') {
            response.message = 'body.type.season requires a String value.';
            return response;
        }
        if (!("gameMode" in body.type)) {
            response.message = 'Missing "gameMode" in body.type.';
            return response;
        }
        if (Object.prototype.toString.call(body.type.gameMode) !== '[object String]') {
            response.message = 'body.type.gameMode requires a String value.';
            return response;
        }


        return true;
    }
}

