var sql = require("mssql");
var sqldrago = require("mssql");

var config = {
    user: 'polemos',
    password: '45l@eUGYUYUGY44#',
    server: 'localhost', 
    database: 'polemos_website' 
};

var config2 = {
    user: 'polemos',
    password: '45l@eUGYUYUGY44#',
    server: 'localhost', 
    database: 'DR2_Member' 
};
sql.connect(config, function (err) {

    err ?
    console.log("Erreur de connexion au serveur SQL: " + err)
    :
    console.log('API est maintenant connecté à la database Site web')
});

exports.sql = sql;
exports.sqldrago = sqldrago;
