"use strict"

const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mysql = require("mysql");
const session = require("express-session");
const flash = require("express-flash")
const config = require("./config");
const daoUsers = require("./daoUsers");

const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

const middlewareSession = session({
	saveUninitialized: false,
	secret: "sesion-user",
	resave: false
});

const app = express();

const ficherosEstaticos = path.join(__dirname, "public");

const daou = new daoUsers.DAOusers(pool);

app.use(express.static(ficherosEstaticos));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(middlewareSession);
app.use(flash());


function setFlash(request, msg){
  request.session.flashMsg = msg;
}

function userExists(request, response, next){
	daou.isUserCorrect(request.body.email, request.body.password, (err, result)=>{
		if(err){
			next(err);
		}
		if(result){
			next();
		}else{//mostrar alerta de usuario no encontrado
      setFlash(request, "Usuario inexistente en base de datos");
      response.render("login", {message: request.session.flashMsg});
		}
	});
}

function initSession(request, response, next){
		request.session.email = request.body.email;
		request.session.password = request.body.password;
		next();
}

app.post("/login.html", userExists, initSession, (request, response, next) =>{ //necesitamos un middleware intermedio que compruebe los datos de sesión para saber si estamos logueados
	response.redirect("profile.html");
});

function insertUser(request, response, next){
  daou.isUserCorrect(request.body.email, request.body.password, (err, result)=>{
		if(err){
			next(err);return;
		}
		if(result){//mostrar alerta de usuario existente
			response.redirect("index.html");
		}else{
			daou.setUser(request.body, (err, result)=>{
        if(err){
          next(err);return;
        }
        if(result){
          next();
        }else{
          next(err);return;
        }
      })
		}
	});
}

app.post("/form.html", insertUser, initSession, (request, response, next) =>{
  response.redirect("profile.html");
});

app.get("/profile.html", (request, response, next) =>{
	if(request.session.email === undefined){
    response.status(403);
    response.redirect("/index.html");
  }else{
    servUser(request, response);
  }
})


app.get("/logout.html", (request, response, next)=>{
	request.session.email = undefined;
  request.session.password = undefined;
	response.redirect("/index.html");
})

function servUser(request, response){
  daou.getUser(request.session.email, (err, user) =>{
		if(err){
			next(err);
		}
		response.status(200);
		response.render("profile", { usuario: user });
	});
}


app.get("/modify_profile", (request, response, next) =>{
  daou.getUser(request.session.email, (err, user)=>{
    if(err){
      next(err);
    }
    response.status(200);
    response.render("modify_profile", { usuario: user });
  });

  /*console.log("hola");
  response.status(200);
  response.end();*/
})

app.get("/", (request, response, next)=>{
  response.render("login", {message: ""});
})

//manejador de error
app.use((error, request, response, next) =>{
	//codigo 500: Internal server error
	response.status(500);
	response.render("error-500", {
		mensaje: error.message,
		pila: error.stack
	});
})

app.use((error, request, response, next) =>{
	//codigo 500: Internal server error
	response.status(404);
	response.render("error-404", {
		mensaje: error.message,
		pila: error.stack
	});
})

app.listen(3000, ()=>{
	console.log("Escuchando del puerto 3000");
})
