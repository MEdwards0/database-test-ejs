const bcrypt = require('bcrypt');

const saltRounds = 10;

const encryptPassword = (userPassword) => {
    let encyptedPassword = bcrypt.hash(userPassword, saltRounds);
    return encyptedPassword;
    // because bycrypt.hash returns a promise, the whole function becomes asynchronous.
}

const checkEncryptedPassword = ({password, encryptedPassword}) => {
    return bcrypt.compare(password, encryptedPassword);
}

module.exports = {encryptPassword, checkEncryptedPassword};
