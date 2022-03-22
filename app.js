const express = require('express');
const app = express();
const ejs = require('ejs');
const http = require('http');
const bodyParser = require('body-parser');
const debug = require('debug')('app');
const PORT = process.env.PORT || 4000;
const client = require('./db.js')
const cookieParser = require('cookie-parser');
const path = require('path');

const user = require('./user.js')

let myUser = new user;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded(({extended: false}))); 
app.use(bodyParser.json());
app.use(cookieParser());

//  Note: Express should have its own implementation of body-parser. It would be a good idea to test if it works the new way.

app.set('views', 'views');
app.set('view engine', 'ejs');

// app.use(express.bodyParser());

app.get('/login', (req, res) => {
    res.render('login', {message: ''});
})

app.get('/register', (req, res) => {
    res.render('register', {message: ''});
})

app.get('/test', (req, res) => {
    client.query('SELECT * FROM "mytable"',
    (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).send(error);
        }
        // res.status(200).send(result.rows);

        let isadmin = result.rows[0].isadmin;

        if (isadmin == 'Y') {
            console.log('match');
        } else {
            console.log('no match');
        }
    });
});

app.get('/edituser', (req, res) => {
    getEditProfile(req, res);
})

app.get('/admin', (req, res)=> {
    processAdmin(req, res);
})

app.post('/login', (req, res, next) => {
    processLogin(req.body, res);
})



app.post('/register2', (req, res, next) => {
    processRegister(req.body, res);

})

app.post('/edituser', (req, res) => {
    processEditUser(req, req.body, res);
})

app.post('/deleteUser', (req, res, next)=> {
    processDeleteUser(req.body, req, res);
})

app.post('/makeAdmin', (req, res, next) => {
    processMakeAdmin(req.body, req, res);
})

app.post('/removeAdmin', (req, res, next) => {
    processRemoveAdmin(req.body, req, res);
})

app.post('/adminChangePassword', (req, res, next) => {
    processAdminChangePassword(req.body, req, res);
})

function processLogin(params, res) {
    let u = params.username;
    let p = params.password;
    // console.log(`Username: ${u} password: ${p}`);

    let tableName = 'mytable';
    client.query(`SELECT id, password, isadmin FROM ${tableName} WHERE username = '${u}'`,
        (error, result) => {
            if (error) {
                console.log(error);
                res.status(500).send(error);
            } else {
                // for some reason, putting in gibberish username and password makes password variable undefined. try catch here to patch the error
                let password;
                try {
                    password = result.rows[0].password;
                } catch (error) {
                    res.render('login', { message: 'Invalid username or password!' });
                }

                if (password === p) {
                    myUser.setUid = result.rows[0].id;
                    myUser.setUsername = u;
                    myUser.setPassword = result.rows[0].password;
                    myUser.setIsAdmin = result.rows[0].isadmin;

                    // console.table(myUser);

                    res.cookie('username', u);
                    res.cookie('uid', result.rows[0].id);
                    res.cookie('isadmin', result.rows[0].isadmin);

                    if (result.rows[0].isadmin === 'Y') {
                        res.render('loggedin', { user: u, admin: '<a href="/admin">Admin Options</a>' });
                    } else {
                        res.render('loggedin', { user: u, admin: '' });
                    }

                } else {
                    res.render('login', { message: 'Invalid username or password!' });
                }
            }
        });
}

function processRegister(params, res) {
    let u = params.username;
    let p = params.password;
    // console.log(`Username: ${u} password: ${p}`);

    let tableName = 'mytable';
    client.query(`INSERT INTO ${tableName} (username, password) VALUES('${u}', '${p}')`,
        (error, result) => {

            if (error) {

                if (error.constraint == 'unique_user') {
                    res.render('register', { message: 'Username is already taken!' }); 
                } 
                console.log(error)
                // res.status(500).send(error);
            }

            res.render('login', {message: 'Account successfully created!'});
        });
}

function getEditProfile(req, res) {
    // let uid = req.cookies.uid;
    let uid = myUser.getUid;
    // console.log(uid);
    let tableName = 'mytable';
    let query = `SELECT * FROM ${tableName} WHERE id = ${uid}`;
    client.query(query,
        (error, result) => {
            if (error) {
                console.log(error);
                res.status(500).send(error);
            } else {
                res.render('edituser', {username: result.rows[0].username, password: result.rows[0].password})
            }
        })
}

function processEditUser(req, params, res) {
    // let uid = req.cookies.uid;
    // let u = req.cookies.username;
    // let p = params.password;

    let uid = myUser.getUid;
    let u = myUser.getUsername;
    let p = params.password;

    // console.table(myUser);
    

    // console.log('DEBUG: uid in processEditUser is: ' + uid);
    let tableName = 'mytable';
    let query = `UPDATE ${tableName} SET password = '${p}' WHERE id = ${uid} AND password != '${p}'`;
    
    client.query(query, (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).send(error);
        } else {
            res.render('login', {message: 'Password successfully updated.'})
        }
    })
}

function processAdmin(req, res) {
     if(myUser.getIsAdmin != 'Y') {
         res.render('login', { message: '' });
     } else {

    let tableName = 'mytable';
    let myQuery = `SELECT * FROM "${tableName}"`
    client.query(myQuery,
        (error, result) => {
            if (error) {
                console.log(error);
                res.status(500).send(error);
            } else {
                //res.render('profile', {uName: result.rows[0].username, password: result.rows[0].password });
                let data = result.rows;
                // console.log(data); // checking what data holds
                res.render('admin', { data });
            }
            
        });
    }
}

// Why did we reference the same id through different variables?
// Gonna do some testing to find out.
// ^^ Probably do to with the posting methods related to the forms.

function processDeleteUser(params, req, res) {
    let uid = params.hiddenId;

    let tableName = 'mytable';
    let myQuery = `DELETE FROM "${tableName}" WHERE id = ${uid}`;
    client.query(myQuery,
        (error, result) => {
            if (error) {
                console.log(error);
                res.status(500).send(error);
            } else {
                processAdmin(req, res);
            }
        });
}

function processMakeAdmin(params, req, res) {
    let uid = params.hiddenMakeAdminId;

    let tableName = 'mytable';
    let myQuery = `UPDATE "${tableName}" SET isadmin = 'Y' WHERE id = ${uid}`;
    client.query(myQuery,
        (error, result) => {
            if (error) {
                console.log(error);
                res.status(500).send(error);
            } else {
                processAdmin(req, res);
            }
        });
}

function processRemoveAdmin(params, req, res) {
    let uid = params.hiddenRemoveAdminId;

    let tableName = 'mytable';
    let myQuery = `UPDATE "${tableName}" SET isadmin = 'N' WHERE id = ${uid}`;
    client.query(myQuery,
        (error, result) => {
            if (error) {
                console.log(error);
                res.status(500).send(error);
            } else {
                processAdmin(req, res);
            }
        });
}

function processAdminChangePassword(params, req, res) {
    let uid = params.changePasswordId;
    let password = params.adminChangePassword;

    // RegEx to get rid of any spaces vv

    password = password.replace(/\s/g, '');

    // console.log('ID is -> ' + uid);
    // console.log('Password is -> ' + password);

    let tableName = 'mytable';
    let myQuery = `UPDATE "${tableName}" SET password = '${password}' WHERE id = ${uid}`;

    client.query(myQuery, (error, result) => {
        if (error) {
            console.log(error);
            res.status(500).send(error);
        } else {
            processAdmin(req, res);
        }
    });
}

app.listen(PORT, function(){
    console.log(`running on port ${PORT}`);
});
