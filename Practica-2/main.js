"use strict"

const https = require("https");
const path = require("path");
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const config = require("./config");
const daoUsuarios = require("./daoUsuarios");

const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

let app = express();

const ficherosEstaticos = path.join(__dirname, "public");

let clavePrivada = fs.readFileSync("./mi_clave.pem");
let certificado = fs.readFileSync("./certificado_firmado.crt");
const daou = new daoUsuarios.DAOusuarios(pool);

app.use(express.static(ficherosEstaticos));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response)=>{
  response.redirect("login");
});

function checkUser(request, response, next){
  daou.isUserCorrect(request.body.usuario, request.body.password, (err, result) =>{
    if(err){
      next(err);return;
    }
    if(request.body.NU){
      if(result === true){
        //mensaje de usuario existente
        response.status(400); //Bad request
        response.end("400 - Bad request"); //response.redirect("login");
      }else{
        daou.setUser(request.body.usuario, request.body.password, (err, result) =>{
          if(err){
            next(err);return;
          }
          if(result){
            response.status(201); //Created
            next();
          }
        });
      }
    }else{
      if(result === true){
        next();
      }else{
        //mensaje de usuario inexistente
        response.status(400); //Bad request
        response.end("400 - Bad request"); //response.redirect("login");
      }
    }

  });
}

app.post("/login", checkUser, (request, response, next)=>{
  daou.getUser(request.body.usuario, (err, user) =>{
    if(err){
      next(err); return;
    }
    response.status(200);
    response.end("Logueado! Eres " + user.login + " y tu contrasena es: " + user.password);
  });
});

app.get("/login", (request, response, next) =>{
  response.render("login"); //hara falta comprobar mensajes
})



let servidor = https.createServer(
  { key: clavePrivada, cert: certificado }, app);

/*Manejador de error interno*/
app.use((error, request, response, next) =>{
	//codigo 500: Internal server error
	response.status(500);
	response.render("error-500", {
		mensaje: error.message,
		pila: error.stack
	});
});

app.get("error/404", (request, response)=>{
    //codigo 404: Page Not Found
    response.status(404);
    response.render("error-404", {
      mensaje: "Error 404 - Page Not Found",
      pila: "This page doesn't exist"
    });
});

servidor.listen(config.port, function(err){

});
