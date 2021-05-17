const UserModel = require('../../users/models/users.model');
const crypto = require('crypto');

exports.hasAuthValidFields = (req, res, next) => {
    let errors = [];
    if (req.body) {
        if (!req.body.username) {
            errors.push('Missing username field');
        }
        if (!req.body.password) {
            errors.push('Missing password field');
        }

        if (errors.length) {
            return res.sendStatus(202);
        } else {
            return next();
        }
    } else {
        return res.sendStatus(202);
    }
};

exports.isPasswordAndUserMatch = (req, res, next) => {
    console.log(req.body.username);
    UserModel.findByName(req.body.username)
        .then((user)=>{
            if(!user[0]){
                res.sendStatus(202);
            }else{
                let passwordFields = user[0].password.split('$');
                let salt = passwordFields[0];
                let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
                if (hash === passwordFields[1]) {
                    req.body = {
                        userid: user[0].userid,
                        email: user[0].mail,
                        permissionLevel: user[0].permissionLevel,
                        provider: 'username',
                        username: user[0].username,
                        className: user[0].className,
                        country: user[0].country,
                        point: user[0].point,
                        registerDate: user[0].registerDate
                    };
                    return next();
                } else {
                    res.sendStatus(202);
                }
            }
        });
};