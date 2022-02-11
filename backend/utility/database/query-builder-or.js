
class QueryBuilderOr {
    constructor() {
        this.query = [];
    }
    addQuery(key, value) {
        var obj = {};
        obj[key] = value;
        this.query.push(obj);
    }

    build() {
        return {$or: this.query};
    }
}

module.exports = QueryBuilderOr