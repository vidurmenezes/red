// See the JQuery documentation at ...
// http://api.jquery.com/
// http://learn.jquery.com/
// See my JQuery and Ajax notes

function login(){
	// post request to send username and password
	$.ajax({
		method: "POST",
		url: "/api/login",
		data:{username:$('#user').val(),password:$('#password').val()},
		error: function(data){alert("username and password incorrect");}
	}).done(function(data){
		console.log(data);
    window.location.href = '/main.html';
	});

	// Normally would check the server to see if the credentials checkout
}

function register(){
  alert($("#fname").val());
	$.ajax({
		method: "POST",
		url: "/api/register",
		data:{username:$('#userregister').val(),
		password:$('#passwordregister').val(),
		password2:$('#passwordregister2').val(),
		fname:$("#fname").val(),
		lname:$("#lname").val(),
		email:$("#email").val()},
		error: function(data){alert("passwords are not the same");}
	}).done(function(data){
    window.location.href = '/login.html';
  });

}

function getuserinfo(){
  $.ajax({
	  url: "/getuser/"+getCookie("username"),
	  type: 'GET',// Fetch the stored token from localStorage and set in the header
	  headers: {'authorization': 'Bearer '+getCookie("token")}
	}).done(function(data){
		var values="";
		console.log(data["username"]);
		values += "<table> <tr> <th>Username</th><th> First Name </th> <th> Last name </th><th> Email </th></tr><tr> "
		values += "<tr><td>"+data["username"].username+
			"</td><td> "+data["username"].fname +
			"</td><td>"+data["username"].lname +
			"</td><td> "+data["username"].email + "</td></tr>";
		values+="</table>"
		console.log(values);
    $("#userfname").val("First Name:" + data["username"].fname);
    $("#userlname").val(data["username"].lname);
    $("#useremail").val("Email: " + data["username"].email);
    $("#userusername").val(data["username"].username)
		$("#info").html(values);
	});
}
function getUser(){

	$.ajax({
	  url: "/getuser/"+getCookie("username"),
	  type: 'GET',// Fetch the stored token from localStorage and set in the header
	  headers: {'authorization': 'Bearer '+getCookie("token")}
	}).done(function(data){
		var values="";
		console.log(data["username"]);
		values += "<table> <tr> <th>Username</th><th> First Name </th> <th> Last name </th><th> Email </th></tr><tr> "
		values += "<tr><td>"+data["username"].username+
			"</td><td> "+data["username"].fname +
			"</td><td>"+data["username"].lname +
			"</td><td> "+data["username"].email + "</td></tr>";
		values+="</table>"
		console.log(values);
		$("#info").html(values);
	});
}

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}
function deleteCookie(cname) {
    var d = new Date(); //Create an date object
    d.setTime(d.getTime() - (1000*60*60*24)); //Set the time to the past. 1000 milliseonds = 1 second
    var expires = "expires=" + d.toGMTString(); //Compose the expirartion date
    window.document.cookie = cname+"="+"; "+expires;//Set the cookie with name and the expiration date

}

function showregister(){
	$("#ui_register").show();
	$("#ui_login").hide();
	$("#registeractivate").hide();
	$("#loginactivate").show();
}
function showlogin(){
	$("#ui_register").hide();
	$("#ui_login").show();
	$("#registeractivate").show();
	$("#loginactivate").hide();
}
// if -1 cookie expired
// if 0 cookie found
function checkCookie(){
	if (getCookie("token") == undefined) {
		return ("login");
	} else {
		return ("loggedin");
 //have cookie
	}
}
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function display_name(){
	console.log("display");
	document.getElementById("loggedin").innerHTML = "Hello " + getCookie("username");

}

function logout(){
	deleteCookie("username");
	deleteCookie("token");
	//console.log("reaching");
	location.reload();

}

// This is executed when the document is ready (the DOM for this document is loaded)
$(function(){
  var test = 1;
	//if cookie exist
		// showmain page

	if(checkCookie() == "loggedin" && window.location.pathname != "/main.html"){
    console.log("logged in ");
    window.location.href = '/main.html';
	}
  else if(window.location.pathname == "/main.html" && checkCookie() == "login"){
      window.location.href = '/login.html';
  }
  else if(checkCookie()=="loggedin" && window.location.pathname == "/main.html"){
    getuserinfo();
  }
	else{

	$("#loginSubmit").on('click',function(){ login(); });
	$("#registerSubmit").on('click',function(){ register(); });


	}

	$("#getUser").on('click',function(){getUser();});
	$("#updateUser").on('click',function(){document.location.href="/userinfo.html";});
	$("#logout").on('click',function(){logout();});

	// Setup all events here and display the appropriate UI

});
