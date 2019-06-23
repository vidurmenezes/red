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

app.use(express.static('static-content'));

var db = new sqlite3.Database('./db/database.db', (err) => {
	if (err) {

		console.error(err.message);
	}
	console.log('Connected to the database.');
});

db.run("CREATE table if not exists users (username VARCHAR(20) PRIMARY KEY,password VARCHAR(100))");
db.run("CREATE table if not exists userinfo(username VARCHAR(20) not null,fname CHAR(100) not null,lname char(100) not null,email char(100) not null,number int(100) not null,PRIMARY key(username,email),foreign KEY (username) references users(username) ON DELETE CASCADE);");

app.get('/api/getList', (req,res) => {
    var list = ["item1", "item2", "item3"];
    res.json(list);
});

app.get('/getuser/:username/',ensureToken, function (req, res) {

	jwt.verify(req.token,'secretkey',function(err,data){
		if(err){
			res.sendStatus(403);
		}
		else{
			console.log("reached here");
			var username = req.params.username;
	console.log(username);

		// http://www.sqlitetutorial.net/sqlite-nodejs/query/
		let sql = 'SELECT * FROM userinfo WHERE username=?';
		db.get(sql, [username], (err, row) => {
			var result = {};
	  		if (err) {
				// Should set res.status!!
	    			result["error"] = err.message;
	  		} else {
	  			console.log(row);
	  			result["username"] = row;
				/*rows.forEach((row) => {
					result["username"].push(row);
				});*/
			}
			res.json(result);
		});

		}
	});
	// http://www.sqlitetutorial.net/sqlite-nodejs/query/

});

app.get('/getotheruser/:username/',ensureToken, function (req, res) {

	jwt.verify(req.token,'secretkey',function(err,data){
		if(err){
			res.sendStatus(403);
		}
		else{
			//console.log("reached here");
			var username = req.params.username;
	//console.log(username);

		// http://www.sqlitetutorial.net/sqlite-nodejs/query/
		let sql = 'SELECT * FROM userinfo';
		db.all(sql, (err, rows) => {
			var result = {};
			result["username"] = [];
	  		if (err) {
				// Should set res.status!!
	    			result["error"] = err.message;
	  		} else {
	  		console.log(rows);
				rows.forEach((row) => {
				result["username"].push(row);
				});
			}
			//console.log(result);
			res.json(result);
		});

		}
	});
	// http://www.sqlitetutorial.net/sqlite-nodejs/query/

});

app.post('/api/register',function(req,res){
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var email = req.body.email;
	var fname = req.body.fname;
	var lname = req.body.lname;
	var number = req.body.number;
	console.log(number);

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
				let sql = 'Insert into userinfo(username,fname,lname,email,number) values (?,?,?,?,?);';
				db.run(sql, [username,fname,lname,email,number], function (err){
					if(err){
						res.status(404);
    					result["error"] = err.message;
					}
				  else{

            result[username] = "Inserted Successful: "+this.changes;
          }
				});
        result["user"] = "successful";
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

app.post('/api/login/',function (req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var result = {};
	console.log("INFO:"+username+" "+password);
	var hashedpassword = crypto.createHash('sha256')
   .update(password)
   .digest('hex');

	//console.log("INFO:"+username+" "+hashedpassword);
	let sql = 'SELECT * FROM users where username=? and password=?;';
	db.get(sql, [username,hashedpassword], function (err,rows){
		//console.log(rows);
  		if (err) {
			res.status(409);
    			result["error"] = "username and password do not match our records";
  		}
  		if(rows == null){
  			res.status(409);
    			result["error"] = "username and password do not match our records";
  		}
  		 else {
			result[username]=(username);
			const user = {
				username: username
			}
			//console.log(result["token"] == undefined);
			if (result["token"] == undefined) {
				const token = jwt.sign({user},'secretkey');
				result["token"] = (token);
				res.cookie('token',token,{maxAge: 9999 * 10 * 50});

				res.cookie("username",username,{maxAge: 9999 * 10 * 50});

			}

			//console.log(result["token"]);
		}


		//console.log(result[username][1]);
		//console.log(JSON.stringify(result));
		res.json(result);
	});

});

function ensureToken(req,res,next){
	const bearerHeader=req.headers["authorization"];
	if(typeof bearerHeader !== 'undefined'){
		const bearer = bearerHeader.split(" ");
		const bearerToken = bearer[1];
		req.token = bearerToken;
		next();
	}
	else{
		res.sendStatus(403);
	}
}

//,'192.168.43.89'
var server = app.listen(8081,function () {
   var port = server.address().port
   console.log("Example app listening at http://localhost:", port)
})
