"use strict"

const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mysql = require("mysql");
const session = require("express-session");
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

app.use(express.static(ficherosEstaticos));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(middlewareSession);

function middlewareIdentificacion(request, response, next){
	if(request.session.email !== undefined){
		next();
	}else{
		next("/index.html");
	}
}

app.post("/profile.html", middlewareIdentificacion, (request, response, next) =>{ //necesitamos un middleware intermedio que compruebe los datos de sesión para saber si estamos logueados	
	let daou = new daoUsers.DAOusers(pool);
		daou.isUserCorrect(request.body.email, request.body.password, (err, result) =>{
			if(err){
				next(err);
			}else if(result){
				response.status(200);
				request.session.email = result[0].email;
				response.render("profile", { usuario: result[0] });
			}else{
				console.log("usuario o contraseña incorrecta");
				response.redirect("/new-user.html");
			}
		}) 
});

//manejador de error
app.use((error, request, response, next) =>{
	//codigo 500: Internal server error
	response.status(500);
	response.render("error-500", {
		mensaje: error.message,
		pila: error.stack
	});
})

app.listen(3000, ()=>{
	console.log("Escuchando del puerto 3000");
})

