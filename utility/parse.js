
module.exports = {

    parseNames: function(names_to_process) {

        var temp = [];
        var names = [];
        for (var i = 0; i <names_to_process.length; i++) {
            if (names_to_process[i] !== ' ') {
                temp.push(names_to_process[i]);
            }
            else {
                if (temp.length !== 0) {
                    names.push(temp.join(''));
                    temp = [];
                }
            }
        }

        return names;
    },
}