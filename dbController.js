const res = require('express/lib/response');
const client = require('./db');

const createUser = ({username, password, result}) => {
    let tableName = 'mytable';
    return client.query(
        `INSERT INTO ${tableName} (username, password, encrypted_password) VALUES('${username}', '${password}', '${result}')`
        );
}

const getUser = ({username}) => {
    let tableName = 'mytable';
    return client.query(
        `SELECT id, password, isadmin, encrypted_password FROM ${tableName} WHERE username = '${username}'`
    );
}

const getUserInfo = ({uid}) => {
    let tableName = 'mytable';
    return client.query(
        `SELECT * FROM ${tableName} WHERE id = ${uid}`
    );
}

const updateUserProfile = ({uid, password, result}) => {
    let tableName = 'mytable';
    return client.query(
        `UPDATE ${tableName} SET password = '${password}', encrypted_password = '${result}' WHERE id = ${uid}` // AND password != '${password}'`
    );
}

const adminRetrieveAllUsers = () => {
    let tableName = 'mytable';
    return client.query(
        `SELECT * FROM "${tableName}"`
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

module.exports = {createUser, getUser, getUserInfo, updateUserProfile, adminRetrieveAllUsers, adminDeleteUser, adminDemoteAdminToUser,
                    adminPromoteUserToAdmin};
                    