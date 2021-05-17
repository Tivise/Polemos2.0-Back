const jwtSecret = require('../../common/config/env.config.js').jwt_secret,
    jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uuid = require('uuid');
const UserModel = require('../../users/models/users.model');

exports.login = (req, res) => {
    try {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log("L'ip a été trouvée ici: " + ip);
        let refreshId = req.body.userid + jwtSecret;
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
        req.body.refreshKey = salt;
        let token = jwt.sign(req.body, jwtSecret);
        let b = Buffer.from(hash);
        let refresh_token = b.toString('base64');
        console.log("LOGIN")
        UserModel.findByName(req.body.username)
        .then((result) => {
            console.log(result);
            if(result.length !== 0){
                const code = result[0].code === 'OK' ? true : false;
                res.status(201).send({accessToken: token, refreshToken: refresh_token, userid: result[0].userid, point: result[0].point, username: result[0].username, verified: code});
            }
            else{
                res.sendStatus(202);
            }
        });
    } catch (err) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log(ip);
        res.status(500).send({errors: err});
    }
};

exports.refresh_token = (req, res) => {
    try {
        req.body = req.jwt;
        let token = jwt.sign(req.body, jwtSecret);
        res.status(201).send({id: token});
    } catch (err) {
        res.status(500).send({errors: err});
    }
};
