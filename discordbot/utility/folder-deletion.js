const fs = require("fs");
const path = require("path");

module.exports = {

    clearFolder: function (folder) {

        /*
        fs.readdir(folder, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(folder, file), (err) => {
                    if (err) throw err;
                });
            }
        });*/
    }
}