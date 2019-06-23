const express = require('express');
const path = require('path');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
const app = express();
var bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
// Serve the static files from the React app
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


var db = new sqlite3.Database('../db/database.db', (err) => {
	if (err) {

		console.error(err.message);
	}
	console.log('Connected to the database.');
});

db.run("CREATE table if not exists users (username VARCHAR(20) PRIMARY KEY,password VARCHAR(100))");
db.run("CREATE table if not exists userinfo(username VARCHAR(20) not null,fname CHAR(100) not null,lname char(100) not null,email char(100) not null,PRIMARY key(username,email),foreign KEY (username) references users(username) ON DELETE CASCADE);");

app.get('/api/getList', (req,res) => {
    var list = ["item1", "item2", "item3"];
    res.json(list);
});

app.post('/api/register',function(req,res){
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var email = req.body.email;
	var fname = req.body.fname;
	var lname = req.body.lname;

	var result = {};
	if(password == password2){
		var hashedpassword = crypto.createHash('sha256').update(password).digest('hex');

	   let sql = 'Insert into users(username,password) values (?,?);';
		db.run(sql, [username, hashedpassword], function (err){
  		if (err) {
			res.status(404);
    			result["error"] = err.message;
  		} else {
			if(this.changes!=1){
    				result["error"] = "Not Inserted";
				res.status(404);
			} else {
				let sql = 'Insert into userinfo(username,fname,lname,email) values (?,?,?,?);';
				db.run(sql, [username,fname,lname,email], function (err){
					if(err){
						res.status(404);
    					result["error"] = err.message;
					}
				  else{
            result[username] = "Inserted Successful: "+this.changes;
          }
				});

			}
		}
		res.json(result);
		});
	}
	else{
		res.status(404);
		result["error"] = "password not the same";
		res.json(result);
	}

});

var server = app.listen(8081, function () {
   var port = server.address().port
   console.log("Example app listening at http://localhost:", port)
})
