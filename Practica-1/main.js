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
const daoAmigos = require("./daoAmigos");

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
const daoa = new daoAmigos.DAOamigos(pool);

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
      response.redirect("login.html");
      //response.render("login", {message: request.session.flashMsg});
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

app.get("/login.html", (request, response, next)=>{
  let mensaje = {message: ""};
  if(request.session.flashMsg !== undefined){
    mensaje = {message: request.session.flashMsg};
  }
  response.render("login", mensaje);
})


function datosCorrectos(request, response, next){
  if(request.body.email === undefined || request.body.password === undefined){
    setFlash(request, "Es obligatorio rellenar el email y la contraseña");
    response.redirect("new-user.html"); //hay que hacer new-user dinamica para que imprima un mensaje
  }else{
    next();
  }
}

function insertUser(request, response, next){
  daou.isUserCorrect(request.body.email, request.body.password, (err, result)=>{
		if(err){
			next(err);return;
		}
		if(result){//mostrar alerta de usuario existente
      setFlash(request, "Usuario existente en base de datos");
      response.redirect("login.html");
      //response.render("login", {message: request.session.flashMsg});
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

app.post("/new_user.html", datosCorrectos, insertUser, initSession, (request, response, next) =>{
  response.redirect("profile.html");
});

app.get("/profile.html", (request, response, next) =>{
	if(request.session.email === undefined){
    response.status(403);
    setFlash(request, "Debes iniciar sesion para acceder a tu perfil");
    response.redirect("login.html");
    //response.render("login", {message: "Debes iniciar sesión para acceder a tu perfil"});
  }else{
    servUser(request, response);
  }
})

app.get("/amigos.html", (request, response, next) =>{
  daoa.getAmigos(request.session.email, (err, rows) =>{
    if(err){
      next(err);
    }
    daou.getUser(request.session.email, (err, user) =>{ //podriamos cargar los datos del usuario desde la session
      if(err){
        next(err);
      }
      response.status(200);
      response.render("list_amigos" , {amigos: rows, usuario: user});
    });
  });
})


app.get("/logout.html", (request, response, next)=>{
	request.session.email = undefined;
  request.session.password = undefined;
  response.status(200);
	response.redirect("login.html");
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
})

app.get("/", (request, response, next)=>{
  response.redirect("login.html");
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
