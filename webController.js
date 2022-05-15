const { createUser, getUser, getUserInfo, updateUserProfile, adminRetrieveAllUsers, adminDeleteUser, adminDemoteAdminToUser, adminPromoteUserToAdmin,
dbConnect, dbDisconnect, importFileToDatabase } = require('./dbController.js');
const user = require('./user.js');
const reader = require('xlsx');
const { encryptPassword, checkEncryptedPassword } = require('./passwords.js');
const { dbErrorHandle } = require('./dbErrorHandling.js');
const superUser = require('./superuser');
const path = require('path');

let myUser = new user; // <- this is bad. In the global scope of things. Should create a new instance whenever we need it within a variable and return the obj?
// refactoring is needed here.

let mySuperUser = new superUser;

const createUserProfile = async (req, res) => {
    
    let username, password;

    try {
        username = req.body.username;
        password = req.body.password;
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
    
    try {
        
        let encrypted_password = await encryptPassword(password);
        await createUser({ username, password, encrypted_password });
        res.render('register', { message: 'User account created!' });

    } catch (error) {
        if (error.constraint === 'unique_user') {
            let dbError = dbErrorHandle(error.constraint);
             res.render('register', { message: dbError })
        } else {
            // console.log(dbErrorHandle(error));
            res.render('login', {message: dbErrorHandle(error)});
        }
    }
    
}

const processUserLogon = async (req, res) => {
    let username, password;

    try {
        username = req.body.username;
        password = req.body.password;
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

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
        res.render('login', { message: dbErrorHandle(error) });
    }

    
}

const displayUserProfile = async (req, res) => {
    let uid;
    try {
        uid = myUser.getUid;
    } catch (error) {
        console.log(error);
        res.status(500).send(error); 
    }
    
    try {
        let result = await getUserInfo({ uid });
        res.render('edituser', { username: myUser.getUsername, password: result.rows[0].encrypted_password });
    } catch (error) {
        res.render('login', { message: dbErrorHandle(error) });
    }

}

const processUpdateUserProfile = async (req, res) => {
    let uid, username, password;
    try {
        uid = myUser.getUid;
        username = myUser.getUsername;
        password = req.body.password;
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }

    try {
        let result = await encryptPassword(password);
        await updateUserProfile({ uid, password, result });
        res.render('login', { message: 'Password successfully updated.' });
    } catch (error) {
        res.render('login', { message: dbErrorHandle(error) });
    }
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
        res.render('login', { message: dbErrorHandle(error) });
    }
}

const processDeleteUser = async (req, res) => {
    let uid;
    try {
        uid = req.body.hiddenId;
    } catch (error) {
        console.log(error);
    }

    try {
        await adminDeleteUser({uid});
        await processAdminAccount(req, res);
    } catch (error) {
        res.render('login', { message: dbErrorHandle(error) });
    }
}

const processMakeAdmin = async (req, res) => {
    let uid;
    try {
        uid = req.body.hiddenMakeAdminId;
    } catch (error) {
        console.log(error);
    }

    try {
        await adminPromoteUserToAdmin({uid});
        await processAdminAccount(req, res);
    } catch (error) {
        res.render('login', { message: dbErrorHandle(error) });
    }
}

const processRemoveAdmin = async (req, res) => {
    let uid;
    try {
        uid = req.body.hiddenRemoveAdminId;
    } catch (error) {
        console.log(error);
    }

    try {
        await adminDemoteAdminToUser({uid});
        await processAdminAccount(req, res);
    } catch (error) {
        res.render('login', { message: dbErrorHandle(error) });
    }
    
}

const processAdminChangePassword = async (req, res) => {
    let uid, password, result;
    try {
        uid = req.body.changePasswordId;
        password = req.body.adminChangePassword;
        password = password.replace(/\s/g, '');
        result = await encryptPassword(password);
    } catch (error) {
        console.log(error);
    }

    try {
        await updateUserProfile({uid, password, result});
        await processAdminAccount(req, res);
    } catch (error) {
        res.render('login', { message: dbErrorHandle(error) });
    }

}

const resetUserObject = async (req, res) => {
    myUser.setIsAdmin = null;
    myUser.setPassword = null;
    myUser.setUid = null;
    myUser.setUsername = null; 

    //try connecting once here, then handle the error?
    // try {
    //     await dbConnect();
    // } catch(error) {
    //     if (error.code == 'ECONNREFUSED') {
    //         res.render('505', {message: dbErrorHandle(error.code)});
    //     }
    // }

    res.render('login', {message: ''});
}

const databaseTryDisconnect = async() => {

    try {
        await dbDisconnect();
    } catch (error) {
        resetUserObject();
        res.render('login', { message: dbErrorHandle(error) });
    }
}

const fileImport = (fileName) => {
    const file = reader.readFile(`./public/files/${fileName}`);
    const data = [];
    const sheets = file.SheetNames;


    for (let i = 0; i < sheets.length; i++) {
        const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
        temp.forEach((res) => {
            data.push(res);
        })
    }

    for (let i = 0; i < data.length; i++) {
        importFileToDatabase(data[i].name, data[i].age, data[i].email, data[i].department);
    }
}

const fileSelector = (req, res) => {
    // console.log('hello!!!!')
    let sampleFile;
    if(!req.files) {
        res.send('file was not found!');
        return;
    }

    sampleFile = req.files.sampleFile;
    let uploadPath = path.resolve(__dirname, `./public/files/${sampleFile.name}`);

    console.log(uploadPath);

    sampleFile.mv(uploadPath, function(err){
        if(err) {
        res.render('fileupload', {message: 'Unable to upload your file.'});
        } else {
            res.render('fileupload', { message: 'File uploaded successfully' });
        }

        fileImport(sampleFile.name)
    })
    
}
module.exports = {
    createUserProfile, processUserLogon, displayUserProfile, processUpdateUserProfile, processAdminAccount,
    processDeleteUser, processMakeAdmin, processRemoveAdmin, processAdminChangePassword, resetUserObject,
    fileImport, fileSelector
};
