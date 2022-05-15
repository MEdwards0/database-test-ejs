const express = require('express');
const app = express();
const ejs = require('ejs');
const http = require('http');
const bodyParser = require('body-parser');
const debug = require('debug')('app');
const PORT = process.env.PORT || 4000;
let fileUpload = require('express-fileupload');
// const client = require('./db.js')
const path = require('path');
const webController = require('./webController.js');
const res = require('express/lib/response');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded(({extended: false}))); 
app.use(bodyParser.json());
app.use(fileUpload());


app.set('views', 'views');
app.set('view engine', 'ejs');

app.get('/login', webController.resetUserObject);

app.get('/register', (req, res) => {
    res.render('register', {message: ''});
})

app.get('/edituser',webController.displayUserProfile);
app.get('/admin', webController.processAdminAccount);
app.get('/file', webController.fileImport);

app.get('/fileupload', (req, res) => {
    res.render('fileupload', {message: ''});
})
app.post('/register', webController.createUserProfile);
app.post('/edituser', webController.processUpdateUserProfile);
app.post('/login', webController.processUserLogon);
app.post('/deleteUser',webController.processDeleteUser)
app.post('/makeAdmin', webController.processMakeAdmin);
app.post('/removeAdmin', webController.processRemoveAdmin);
app.post('/adminChangePassword',webController.processAdminChangePassword);

app.post('/fileselector', (req, res) => {
    webController.fileSelector(req, res);
})




app.listen(PORT, function(){
    console.log(`running on port ${PORT}`);
});

/* 
TO DO:

- Update password implementation to use hashing instead of storing plaintext pwd.
- Create/ update database table to better fit this new password format. (longer character lengths)

- Change update login password options in profile edit and admin edit. <- Hashing passwords
- connect once, disconnect every time?
*/
