const { v4: uudiv4 } = require("uuid");

const sessionSecret = uudiv4();

const passwordToken = uudiv4();

module.exports = { sessionSecret, passwordToken };
