const { createUser, getUser, getUserInfo, updateUserProfile, adminRetrieveAllUsers, adminDeleteUser, adminDemoteAdminToUser, adminPromoteUserToAdmin } = require('./dbController.js');
const user = require('./user.js');
const { encyptPassword, checkEncryptedPassword } = require('./passwords.js');

let myUser = new user;

const createUserProfile = (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    encyptPassword(password)
        .then(result => {
            createUser({ username, password, result })
                .then(() => res.render('register', { message: 'User account created!' }))
                .catch(error => {
                    console.log(error);

                    if (error.constraint === 'unique_user') {
                        res.render('register', { message: 'User account already exists!' })
                    }
                });
        })
        .catch(error => {
            console.log(error);
            res.status(500).send(error);
        });

}

// const processUserLogon = (req, res) => {
//     let username = req.body.username;
//     let password = req.body.password;

//     getUser({username})
//     .then(result => {
//         if (result.rowCount == 0) {
//             res.render('login', { message: 'Invalid username or password!' });
//         } else {
//             let data = result;
//             let encryptedPassword = result.rows[0].encrypted_password;
//             checkEncryptedPassword({ password, encryptedPassword })
//             .then(result => {
//                 if (result) {
//                 myUser.setUid = data.rows[0].id;
//                 myUser.setUsername = username;
//                 myUser.setPassword = data.rows[0].password;
//                 myUser.setIsAdmin = data.rows[0].isadmin;
//                 if (myUser.getIsAdmin === 'Y') {
//                     res.render('loggedin', { user: username, admin: '<a href="/admin">Admin Options</a>' });
//                 } else {
//                     res.render('loggedin', { user: username, admin: '' });
//                 }

//             } else {
//                 res.render('login', { message: 'Invalid username or password!' });
//             }
//             })
//                 .catch(error => {
//                     console.log(error);
//                 });

//         }
//     })
//     .catch(error => {
//         console.log(error);
//     });
// }

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



    // getUser({ username })
    //     .then(result => {
    //         if (result.rowCount == 0) {
    //             res.render('login', { message: 'Invalid username or password!' });
    //         } else {
    //             let data = result;
    //             let encryptedPassword = result.rows[0].encrypted_password;
    //             let hashedPword = await checkEncryptedPassword({ password, encryptedPassword })
    //                  if (hashedPword) {
    //                     myUser.setUid = data.rows[0].id;
    //                     myUser.setUsername = username;
    //                     myUser.setPassword = data.rows[0].password;
    //                     myUser.setIsAdmin = data.rows[0].isadmin;
    //                     if (myUser.getIsAdmin === 'Y') {
    //                         res.render('loggedin', { user: username, admin: '<a href="/admin">Admin Options</a>' });
    //                     } else {
    //                         res.render('loggedin', { user: username, admin: '' });
    //                     }

    //                 } else {
    //                     res.render('login', { message: 'Invalid username or password!' });
    //                 }
    //                 // .catch(error => {
    //                 //     console.log(error);
    //                 // });

    //         }
    //     })
    // .catch(error => {
    //     console.log(error);
    // });
}

const displayUserProfile = (req, res) => {
    let uid = myUser.getUid;

    getUserInfo({ uid })
        .then(result => {
            res.render('edituser', { username: myUser.getUsername, password: result.rows[0].encrypted_password })

        })
        .catch(error => {
            console.log(error);
            res.status(500).send(error);
        })
}

const processUpdateUserProfile = (req, res) => {
    let uid = myUser.getUid;
    let username = myUser.getUsername;
    let password = req.body.password;

    encyptPassword(password)
        .then(result => {
            updateUserProfile({ uid, password, result })
                .then(() => res.render('login', { message: 'Password successfully updated.' }))
                .catch(error => {
                    console.log(error);
                    res.status(500).send(error);

                })
        })
        .catch(error => {
            console.log(error);
            res.status(500).send(error);

        })
}

const processAdminAccount = (req, res) => {
    if (myUser.getIsAdmin != 'Y') {
        res.render('login', { message: '' });
    } else {
        adminRetrieveAllUsers()
            .then(result => {
                let data = result.rows;
                res.render('admin', { data });
            })
            .catch(error => {
                console.log(error);
                res.status(500).send(error);
            })
    }
}

const processDeleteUser = (req, res) => {
    let uid = req.body.hiddenId;

    adminDeleteUser({ uid })
        .then(() => processAdminAccount(req, res))
        .catch(error => {
            console.log(error);
            res.status(500).send(error);
        });
}

const processMakeAdmin = (req, res) => {
    let uid = req.body.hiddenMakeAdminId;

    adminPromoteUserToAdmin({ uid })
        .then(() => processAdminAccount(req, res))
        .catch(error => {
            console.log(error);
            res.status(500).send(error);
        });
}

const processRemoveAdmin = (req, res) => {
    let uid = req.body.hiddenRemoveAdminId;

    adminDemoteAdminToUser({ uid })
        .then(() => processAdminAccount(req, res))
        .catch(error => {
            console.log(error);
            res.status(500).send(error);
        });
}

const processAdminChangePassword = (req, res) => {
    let uid = req.body.changePasswordId;
    let password = req.body.adminChangePassword;

    password = password.replace(/\s/g, '');
    encyptPassword(password)
        .then(result => {
            updateUserProfile({ uid, password, result })
                .then(() => processAdminAccount(req, res))
                .catch(error => {
                    console.log(error);
                    res.status(500).send(error);
                });
        })
        .catch(error => {
            console.log(error);
            res.status(500).send(error);
        });
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
