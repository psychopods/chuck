const {Pool} = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
})

module.exports = pool