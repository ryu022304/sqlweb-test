const path = require('path');

module.exports = {
    mode: "development",
    entry: {
        sqlweb: './src/sqlweb.js'
    },
    output: {
        path: `${__dirname}/dist`,
        filename: "[name].bundle.js"
    }
};