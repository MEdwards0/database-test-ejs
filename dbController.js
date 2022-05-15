const {client, dbConnect, dbDisconnect} = require('./db');
const { dbErrorHandle } = require('./dbErrorHandling');

const createUser = ({username, password, result}) => {
    let tableName = 'mytable';
    return client.query(
        `INSERT INTO ${tableName} (username, password, encrypted_password) VALUES('${username}', '${password}', '${result}')`
        );
}

const getUser = async ({username}) => {
    let tableName = 'mytable';
    // await dbConnect();
    return client.query(
        `SELECT id, password, isadmin, encrypted_password FROM ${tableName} WHERE username = '${username}'`
    );
}

const getUserInfo = async ({uid}) => {
    let tableName = 'mytable';
    // await dbConnect();
    return client.query(
        `SELECT * FROM ${tableName} WHERE id = ${uid}`
    );
}

const updateUserProfile = async ({uid, password, result}) => {
    let tableName = 'mytable';
    // await dbConnect();
    return client.query(
        `UPDATE ${tableName} SET password = '${password}', encrypted_password = '${result}' WHERE id = ${uid}` // AND password != '${password}'`
    );
}

const adminRetrieveAllUsers = async() => {
    let tableName = 'mytable';

    // try {
    //     await dbConnect();  
    // } catch (error) {
    //     console.log('catch');
    // }
    
    return client.query(
        `SELECT id, username, '********' AS password, isadmin, '********' AS encrypted_password  FROM "${tableName}"`
    );
}

const adminDeleteUser = ({uid}) => {
    let tableName = 'mytable';
    return client.query(
        `DELETE FROM "${tableName}" WHERE id = ${uid}`
    );
}

const adminPromoteUserToAdmin = ({uid}) => {
    let tableName = 'mytable';
    return client.query(
        `UPDATE "${tableName}" SET isadmin = 'Y' WHERE id = ${uid}`
    );
}

const adminDemoteAdminToUser = ({ uid }) => {
    let tableName = 'mytable';
    return client.query(
        `UPDATE "${tableName}" SET isadmin = 'N' WHERE id = ${uid}`
    );
}

const importFileToDatabase = (name, age, email, dept) => {
    let tableName = 'files';
    return client.query(
        `INSERT INTO ${tableName} (name, age, email, department) VALUES ('${name}', ${age}, '${email}', '${dept}')`
    )
}

module.exports = {createUser, getUser, getUserInfo, updateUserProfile, adminRetrieveAllUsers, adminDeleteUser, adminDemoteAdminToUser,
                    adminPromoteUserToAdmin, dbConnect, dbDisconnect, importFileToDatabase};
