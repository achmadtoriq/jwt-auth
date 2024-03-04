const fs = require('fs');
const path = require('path');

console.log(path.join(__dirname, 'credentials.json'));
const credentials = path.join(__dirname, 'credentials.json')

module.exports = credentials;