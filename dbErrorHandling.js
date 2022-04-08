const dbErrorHandle = (dbError) => {
    switch (dbError) {
        case 'unique_user':
            return 'User Account already exists!'
            break;
        default:
            return 'unhandled db error.'
            break;
    }
}

module.exports = {dbErrorHandle};