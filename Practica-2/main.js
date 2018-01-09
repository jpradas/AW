"use strict"

const https = require("https");
const path = require("path");
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const passport = require("passport");
const passportHTTP = require("passport-http");
const config = require("./config");
const daoUsuarios = require("./daoUsuarios");
const daoPartidas = require("./daoPartidas");

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
const daop = new daoPartidas.DAOpartidas(pool);

app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

passport.use(new passportHTTP.BasicStrategy({ realm: "Pagina protegida por contraseña" }, (user, pass, callback) =>{
  daou.getUser(user, (err, usuario) =>{
    if(err){
      callback(err);return;
    }
    if(usuario !== undefined && pass === usuario.password){
      callback(null, { userId: user });
    }else{
      callback(null, false);
    }
  })
}));

app.get("/", (request, response)=>{
  response.sendFile("index.html");
});

app.get("/checkUser", (request, response) =>{
  daou.isUserCorrect(request.query.user, request.query.password, (err, result) =>{
    if(err){
      response.status(500); //Server Internal Error
      response.end();
      return;
    }else{
      response.status(200); //OK
      response.json({ resultado: result });
    }
  });
});

app.get("/setUser", (request, response) =>{
  daou.isUserCorrect(request.query.user, request.query.password, (err, result) =>{
    if(err){
      response.status(500); //Server Internal Error
      response.end();
      return;
    }
    if(!result){
      daou.setUser(request.query.user, request.query.password, (err, result) =>{
        if(err){
          response.status(500); //Internal Server Error
          response.end();
          return;
        }
        if(result){
          response.status(201); //Created
          response.json({ resultado: result });
        }
      })
    }else{
      response.status(400); //Bad request
      response.end();
    }
  });
});

app.get("/getPartidas", (request, response) =>{
  daou.getId(request.query.user, (err, idUser) =>{
    if(err){
      response.status(500);
      response.end();return;
    }
    if(!isNaN(idUser)){
      response.status(400);
      response.end();return;
    }else{
      daop.getPartidas(idUser, (err, rows) =>{
        if(err){
          response.status(500);
          response.end();return;
        }
        response.status(200);
        response.json({ partidas: rows });
      })
    }
  })
});

app.get("/crearPartida", passport.authenticate('basic', {session: false}), (request, response) =>{
  daop.setPartida(request.query.partida, request.query.estado, (err, idPartida) =>{
    if(err){
      response.status(500);
      response.end();return;
    }
    daou.getId(request.query.user, (err, idUser) =>{
      if(err){
        response.status(500);
        response.end();return;
      }
      if(!isNaN(idUser)){
        response.status(500);
        response.end();return;
      }else{
        daop.setJugadorPartida(idUser, idPartida, (err, result) =>{
          if(err){
            response.status(500);
            response.end();return;
          }
          response.status(201);
          response.json({ resultado: result });
        })
      }
    })

  })
});

app.get("/unirsePartida", passport.authenticate('basic', {session: false}), (request, response) =>{
  daou.getId(request.query.user, (err, idUser) =>{
    if(err){
      response.status(500);
      response.end();return;
    }
    if(!isNaN(idUser)){
      response.status(500);
      response.end();return;
    }else{
      daop.existePartida(request.query.idPartida, (err, result) =>{
        if(err){
          response.status(500);
          response.end();return;
        }
        if(!result){
          response.status(404);
          response.end();return;
        }else{
          daop.hayHueco(request.query.idPartida, (err, result) =>{
            if(err){
              response.status(500);
              response.end();return;
            }
            if(!result){
              response.status(400);
              response.end();return;
            }else{//faltaria comprobar que no estoy ya dentro de la partida
              daop.setJugadorPartida(idUser, request.query.idPartida, (err, result) =>{
                if(err){
                  response.status(500);
                  response.end();return;
                }
                response.status(201);
                response.json({ resultado: result });
              });
            }
          });
        }
      });
    }
  });
});

let servidor = https.createServer(
  { key: clavePrivada, cert: certificado }, app);

servidor.listen(config.port, function(err){

});
