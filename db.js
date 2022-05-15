const res = require('express/lib/response');
const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'matthew.edwards3',
    password: 'password',
    port: 5432,
})

async function dbConnect() {
    await client.connect();
    console.log('database connected.');
    
};

async function dbDisconnect() {
    await client.end();
    console.log('database disconnected.'); 
}

// Temporary:

dbConnect();

module.exports = {client, dbConnect, dbDisconnect};
