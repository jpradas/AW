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
app.use(bodyParser.json());
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

app.post("/setUser", (request, response) =>{
  daou.isUserCorrect(request.body.user, request.body.password, (err, result) =>{
    if(err){
      response.status(500); //Server Internal Error
      response.end();
      return;
    }
    if(!result){
      daou.setUser(request.body.user, request.body.password, (err, result) =>{
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

app.post("/crearPartida", passport.authenticate('basic', {session: false}), (request, response) =>{
  daop.setPartida(request.body.partida, (err, idPartida) =>{
    if(err){
      response.status(500);
      response.end();return;
    }
    daou.getId(request.body.user, (err, idUser) =>{
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

app.put("/unirsePartida", passport.authenticate('basic', {session: false}), (request, response) =>{
  let idPartida = request.body.idPartida;
  daou.getId(request.body.user, (err, idUser) =>{
    if(err){
      response.status(500);
      response.end();return;
    }
    if(!isNaN(idUser)){
      response.status(500);
      response.end();return;
    }
    else{
      daop.existePartida(idPartida, (err, result) =>{
        if(err){
          response.status(500);
          response.end();return;
        }
        if(!result){
          response.status(404);
          response.end();return;
        }else{
          daop.hayHueco(idPartida, (err, jugadores) =>{
            if(err){
              response.status(500);
              response.end();return;
            }
            if(jugadores > 3){
              response.status(400);
              response.end();return;
            }else{
              daop.estaDentroPartida(idUser, idPartida, (err, result) =>{
                if(err){
                  response.status(500);
                  response.end();return;
                }
                if(result){
                  response.status(405);
                  response.end();return;
                }
                else{
                  daop.setJugadorPartida(idUser, idPartida, (err, result) =>{
                    if(err){
                      response.status(500);
                      response.end();return;
                    }
                    response.status(201);
                    jugadores = jugadores + 1;
                    console.log(jugadores);
                    response.json({ resultado: result, jugadores: jugadores });
                  });
                }
              })
            }
          });
        }
      });
    }
  });
});

app.get("/buscarPartida", passport.authenticate('basic', {session: false}), (request, response) =>{
  daop.existePartida(request.query.idPartida, (err, result) =>{
    if(err){
      response.status(500);
      response.end();return;
    }
    if(!result){
      response.status(404);
      response.end();return;
    }else{
      daop.getPartida(request.query.idPartida, (err, partida) =>{
        if(err){
          response.status(500);
          response.end();return;
        }
        daop.getJugadores(request.query.idPartida, (err, jugadores) =>{
          if(err){
            response.status(500);
            response.end();return;
          }
          response.json({ partida: partida, jugadores: jugadores });
        });
      })
    }
  });
});

app.post("/iniciarPartida",  passport.authenticate('basic', {session: false}), (request, response) =>{
  daop.getJugadores(request.body.idPartida, (err, jugadores) =>{
    if(err){
      response.status(404);
      response.end();return;
    }
    let estado = {jugador1:jugadores[0].login, jugador2:jugadores[1].login, jugador3:jugadores[2].login,
       jugador4:jugadores[3].login, cartasJugador1:[], cartasJugador2:[], cartasJugador3:[],
       cartasJugador4:[], ordenJugadores:[1,2,3,4], turnoJugador:"", cartasMesa: 0, valorCartasMesa: []};

    repartirCartasyJugadores(estado);

    daop.setEstadoPartida(request.body.idPartida, JSON.stringify(estado),  (err, result) =>{
      if(err){
        response.status(404);
        response.end();return;
      }
      else{
        response.json({estado : estado});
      }
    });
  });
});

app.get("/estadoPartida",  passport.authenticate('basic', {session: false}), (request, response) =>{
  daop.getEstadoPartida(request.query.idPartida, (err, estado) => {
    if(err){
      response.status(500);
      response.end();return;
    }
    else {
      console.log(estado);
      response.json({estado : estado});
    }
  });
});

app.put("/realizarAccion",  passport.authenticate('basic', {session: false}), (request, response) =>{
  //Cambiar el estado

  daop.actualizarEstado(request.body.idPartida, JSON.stringify(estado),  (err, result) =>{
    if(err){
      response.status(404);
      response.end();return;
    }
    else{
      response.json({estado : estado});
    }
  })
});

function repartirCartasyJugadores(estado){
  let mazo = [];
  let palos = ["S", "H", "C", "D"];
  let valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  let i = 0;
  let j = 0;
  for(i = 0; i < palos.length; i++){
		for(j = 0; j < valores.length; j++){
			let carta = {Valor: valores[j], Palo: palos[i]};
			mazo.push(carta);
		}
	}
  //Barajo 500 veces las cartas
  for (i = 0; i < 500; i++){
    //Math.floor redondea a entero por lo alto
		var pos1 = Math.floor((Math.random() * mazo.length));
		var pos2 = Math.floor((Math.random() * mazo.length));
		var tmp = mazo[pos1];
		mazo[pos1] = mazo[pos2];
		mazo[pos2] = tmp;

    var pos3 = Math.floor((Math.random() * 4));
		var pos4 = Math.floor((Math.random() * 4));
		var tmp = estado.ordenJugadores[pos3];
		estado.ordenJugadores[pos3] = estado.ordenJugadores[pos4];
		estado.ordenJugadores[pos4] = tmp;
	}

  estado.turnoJugador = estado.ordenJugadores[0];

  for (j=0; j < 13; j++){
    estado.cartasJugador1.push(mazo[j]);
  }
  for (j=13; j < 26; j++){
    estado.cartasJugador2.push(mazo[j]);
  }
  for (j=26; j < 39; j++){
    estado.cartasJugador3.push(mazo[j]);
  }
  for (j=39; j < 52; j++){
    estado.cartasJugador4.push(mazo[j]);
  }
}

let servidor = https.createServer(
  { key: clavePrivada, cert: certificado }, app);

servidor.listen(config.port, function(err){

});
