const fetch = require('node-fetch');
const fs = require('fs'); // Use promises for cleaner async/await handling
const path = require("path");
const https = require('https');
const axios = require('axios');


module.exports = {


    download: async function (imageURL, dirPath, fileName) {
        // Create the directory if it does not exist


        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }


        try {
            const response = await axios.get(imageURL, {responseType: 'stream'});
            const fileStream = fs.createWriteStream(`${dirPath}/${fileName}`);
            response.data.pipe(fileStream);
            console.log('Downloading image...');
            await new Promise((resolve) => fileStream.on('finish', resolve));
            console.log('Download complete!');
            return true;
        } catch (error) {
            console.error(`Error downloading image: ${error.message}`);
            return false;
        }

        return false;
    }
}