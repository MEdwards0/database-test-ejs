const bcrypt = require('bcrypt');

const saltRounds = 10;

const encyptPassword = (userPassword) => {
    let encyptedPassword = bcrypt.hash(userPassword, saltRounds);
    return encyptedPassword;
}

const checkEncryptedPassword = async ({password, encryptedPassword}) => {
    return bcrypt.compare(password, encryptedPassword);
}

module.exports = {encyptPassword, checkEncryptedPassword};
