var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ifyoufall7getup8",
    database: "myproject"
});

connection.connect(function(error) {
    if(error) console.log(error);
    else{
        console.log("connected to database!");
    }
});
global.db = connection;

module.exports = connection;