
class QueryBuilderAnd {
    constructor() {
        this.query = { $and: [] };
    }

    addOr(queries) {
        this.query.$and.push(queries);
    }

    build() {
        return this.query;
    }
}

module.exports = QueryBuilderAnd