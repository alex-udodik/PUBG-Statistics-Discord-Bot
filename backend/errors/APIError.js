class APIError extends Error {
    constructor(args) {
        super(args);
        this.name = "APIError";
        this.message = args;
    }
}

module.exports = APIError;