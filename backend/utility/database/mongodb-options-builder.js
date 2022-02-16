class MongoOptionsBuilder {
    constructor() {
        this.options = {}
    }

    addProjection(key, value) {
        this.options.projection[key] = value;
    }

    build() {
        return this.options;
    }
}

module.exports = MongoOptionsBuilder;