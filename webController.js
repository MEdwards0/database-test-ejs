const { createUser, getUser, getUserInfo, updateUserProfile, adminRetrieveAllUsers, adminDeleteUser, adminDemoteAdminToUser, adminPromoteUserToAdmin } = require('./dbController.js');
const user = require('./user.js');
const { encryptPassword, checkEncryptedPassword } = require('./passwords.js');
const { dbErrorHandle } = require('./dbErrorHandling.js');
const superUser = require('./superuser');

let myUser = new user; // <- this is bad. In the global scope of things. Should create a new instance whenever we need it within a variable and return the obj?
// refactoring is needed here.

let mySuperUser = new superUser;

const createUserProfile = async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    try {
        let encrypted_password = await encryptPassword(password);
        await createUser({ username, password, encrypted_password });
        res.render('register', { message: 'User account created!' });

    } catch (error) {

        
        if (error.constraint === 'unique_user') {
            let dbError = dbErrorHandle(error.constraint);
             res.render('register', { message: dbError })
        } else {
            console.log(error);
            res.status(500).send(error);
        }
    }
}

const processUserLogon = async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    try {

        let result = await getUser({ username });

        if (result.rowCount == 0) {
            res.render('login', { message: 'Invalid username or password!' });
        } else {
            let data = result
            let encryptedPassword = result.rows[0].encrypted_password;
            let hashedPword = await checkEncryptedPassword({ password, encryptedPassword });

            if (hashedPword) {
                myUser.setUid = data.rows[0].id;
                mySuperUser.setUid = myUser.getUid;
                myUser.setUsername = username;
                myUser.setPassword = data.rows[0].password;
                myUser.setIsAdmin = data.rows[0].isadmin;

                if (myUser.getIsAdmin === 'Y') {
                    res.render('loggedin', { user: username, admin: '<a href="/admin">Admin Options</a>' });
                } else {
                    res.render('loggedin', { user: username, admin: '' });
                }
            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

const displayUserProfile = async (req, res) => {
    
    try {
        let uid = myUser.getUid;
        let result = await getUserInfo({ uid });
        res.render('edituser', { username: myUser.getUsername, password: result.rows[0].encrypted_password });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

}

const processUpdateUserProfile = async (req, res) => {
    let uid = myUser.getUid;
    let username = myUser.getUsername;
    let password = req.body.password;

    try {
        let result = await encryptPassword(password);
        await updateUserProfile({ uid, password, result });
        res.render('login', { message: 'Password successfully updated.' });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }




    // encryptPassword(password)
    //     .then(result => {
    //         updateUserProfile({ uid, password, result })
    //             .then(() => res.render('login', { message: 'Password successfully updated.' }))
    //             .catch(error => {
    //                 console.log(error);
    //                 res.status(500).send(error);

    //             })
    //     })
    //     .catch(error => {
    //         console.log(error);
    //         res.status(500).send(error);

    //     })
}

const processAdminAccount = async (req, res) => {

    try {
        if (myUser.getIsAdmin != 'Y') {
            res.render('login', { message: '' });
        } else {
            let result = await adminRetrieveAllUsers()
            let data = result.rows;
            res.render('admin', { data });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

const processDeleteUser = async (req, res) => {
    // let uid = req.body.hiddenId;

    try {
        let uid = req.body.hiddenId;
        await adminDeleteUser({uid});
        await processAdminAccount(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

    // adminDeleteUser({ uid })
    //     .then(() => processAdminAccount(req, res))
    //     .catch(error => {
    //         console.log(error);
    //         res.status(500).send(error);
    //     });
}

const processMakeAdmin = async (req, res) => {

    try {
        let uid = req.body.hiddenMakeAdminId;
        await adminPromoteUserToAdmin({uid});
        await processAdminAccount(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
    

    // adminPromoteUserToAdmin({ uid })
    //     .then(() => processAdminAccount(req, res))
    //     .catch(error => {
    //         console.log(error);
    //         res.status(500).send(error);
    //     });
}

const processRemoveAdmin = async (req, res) => {

    try {
        let uid = req.body.hiddenRemoveAdminId;
        await adminDemoteAdminToUser({uid});
        await processAdminAccount(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
    

    // adminDemoteAdminToUser({ uid })
    //     .then(() => processAdminAccount(req, res))
    //     .catch(error => {
    //         console.log(error);
    //         res.status(500).send(error);
    //     });
}

const processAdminChangePassword = async (req, res) => {

    try {
        let uid = req.body.changePasswordId;
        let password = req.body.adminChangePassword;
        password = password.replace(/\s/g, '');
        
        let result = await encryptPassword(password);
        await updateUserProfile({uid, password, result});
        await processAdminAccount(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
    

    // password = password.replace(/\s/g, '');
    // encryptPassword(password)
    //     .then(result => {
    //         updateUserProfile({ uid, password, result })
    //             .then(() => processAdminAccount(req, res))
    //             .catch(error => {
    //                 console.log(error);
    //                 res.status(500).send(error);
    //             });
    //     })
    //     .catch(error => {
    //         console.log(error);
    //         res.status(500).send(error);
    //     });
}

const resetUserObject = (req, res) => {
    myUser.setIsAdmin = null;
    myUser.setPassword = null;
    myUser.setUid = null;
    myUser.setUsername = null;

    res.render('login', { message: '' });
}

module.exports = {
    createUserProfile, processUserLogon, displayUserProfile, processUpdateUserProfile, processAdminAccount,
    processDeleteUser, processMakeAdmin, processRemoveAdmin, processAdminChangePassword, resetUserObject
};
