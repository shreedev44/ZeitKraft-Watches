const { v4: uudiv4 } = require("uuid");

const sessionSecret = uudiv4();

module.exports = { sessionSecret };
