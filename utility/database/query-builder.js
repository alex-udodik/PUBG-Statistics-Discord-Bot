
class MongoQueryBuilder {
    constructor() {
        this.query = []
    }

    addQuery(key_value_pairs) {
        for (var i = 0; i < key_value_pairs.length; i++) {
            var obj = {};
            obj[Object.keys(key_value_pairs[i])[0]] = key_value_pairs[i][Object.keys(key_value_pairs[i])[0]];
            this.query.push(obj)
        }
    }

    build() {
        return {$or: this.query};
    }
}

module.exports = MongoQueryBuilder;