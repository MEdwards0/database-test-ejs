const res = require('express/lib/response');
const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'matthew.edwards3',
    password: 'password',
    port: 5432,
})

client.connect();

module.exports = client;