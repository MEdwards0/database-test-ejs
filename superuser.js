const { is } = require('express/lib/request');
const user = require('./user');

class SuperUser extends user{

    constructor(uid, username, password, isadmin) {
        super(uid, username, password);
        this.isadmin = isadmin;
    }

    get getIsAdmin() {
        return this.isadmin;
    }

    set setIsAdmin(isadmin) {
        this.isadmin = isadmin;
    }
}

module.exports = SuperUser;