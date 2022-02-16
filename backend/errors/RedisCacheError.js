class RedisCacheError extends Error {
    constructor(args) {
        super(args);
        this.name = "RedisCacheError";
        this.message = args;
    }
}

module.exports = RedisCacheError;