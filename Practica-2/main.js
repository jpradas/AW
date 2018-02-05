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
    else{
      daop.getPartida(request.body.idPartida, (err, partida) =>{
        let estado = {jugador1:jugadores[0].login, jugador2:jugadores[1].login, jugador3:jugadores[2].login,
           jugador4:jugadores[3].login, cartasJugador1:[], cartasJugador2:[], cartasJugador3:[],
           cartasJugador4:[], ordenJugadores:[jugadores[0].login,jugadores[1].login,jugadores[2].login,jugadores[3].login],
           turnoJugador:"", mentiroso: false, valorCartasMesa: [], cartasMesaReal: [], ganador: ""};

        repartirCartasyJugadores(estado);

        daop.setEstadoPartida(request.body.idPartida, JSON.stringify(estado),  (err, result) =>{
          if(err){
            response.status(404);
            response.end();return;
          }
          else{
            response.json({estado : estado, id : request.body.idPartida, nombre: partida.nombre });
          }
        });
      });
    }
  });
});

app.get("/estadoPartida",  passport.authenticate('basic', {session: false}), (request, response) =>{
  daop.getPartida(request.query.idPartida, (err, partida) => {
    if(err){
      response.status(404);
      response.end();return;
    }
    else {
      partida.estado = JSON.parse(partida.estado);
      partida.estado = encapsularEstado(partida.estado, request.query.user);
      response.json({partida : partida});
    }
  });
});

function encapsularEstado(estado, user) {
  if (estado.jugador1 !== user){
    estado.cartasJugador1 = estado.cartasJugador1.length;
  }
  if (estado.jugador2 !== user){
    estado.cartasJugador2 = estado.cartasJugador2.length;
  }
  if (estado.jugador3 !== user){
    estado.cartasJugador3 = estado.cartasJugador3.length;
  }
  if (estado.jugador4 !== user){
    estado.cartasJugador4 = estado.cartasJugador4.length;
  }
  estado.cartasMesaReal = "";
  return estado;
}



app.put("/realizarAccion",  passport.authenticate('basic', {session: false}), (request, response) =>{
  //Comprobar que hay cartas seleccionadas en la accion, por si se cuela del jquery anterior
  //Accion siempre tendra 1 como minimo, por el valor que se ha dado
  let accion = request.body.accion;
  let turno = "";
  if (typeof(accion) === "boolean"){
    turno = "mentiroso";
  }else if (accion.length > 1){
    turno = "normal";
  }
  if (turno !== ""){
    daop.existePartida(request.body.idPartida, (err, result) =>{
      if(err){
        response.status(404);
        response.end();return;
      }
      daop.getPartida(request.body.idPartida, (err, partida) => {
        if(err){
          response.status(404);
          response.end();return;
        }
        let jugador = request.body.jugador;
        let estado = JSON.parse(partida.estado);
        if (estado.turnoJugador === jugador){
          if (turno === "mentiroso"){
            //partida.estado =
            partida.estado = mentiroso(estado, accion);
          }
          else{
            let valorIndicado = accion.pop();
            partida.estado = actualizarEstado(estado, accion, valorIndicado);
          }
          daop.actualizarEstado(request.body.idPartida, JSON.stringify(partida.estado),  (err, result) =>{
            if(err){
              response.status(404);
              response.end();return;
            }
            else{
              response.json({partida : partida});
            }
          });
        }
        else{
          response.json({error : "No puedes realizar una accion, no es tu turno"});
        }
      });
    })
  }
});


function mentiroso(estado, mentiroso){
  let indice;
  let jugadorMentiroso;
  let fin = false;
  //Pone las cartas del centro en el jugador que ha mentido, el anterior al actual
  if (mentiroso){
    //El jugador sin cartas ha mentido y no es el ganador
    if (estado.ganador !== ""){
      estado.ganador = "";
    }
    indice = estado.ordenJugadores.indexOf(estado.turnoJugador) - 1;
    if (indice === -1){
      indice = 3;
    }
    jugadorMentiroso = estado.ordenJugadores[indice];
  }
  //Si no ha mentido, se pone en la mano del jugador que ha pulsado mentiroso
  else{
    if (estado.ganador === ""){
      jugadorMentiroso = estado.turnoJugador;
      indice = estado.ordenJugadores.indexOf(estado.turnoJugador) + 1;
      if (indice === 4){
        indice = 0;
      }
      estado.turnoJugador = estado.ordenJugadores[indice];
    }
    //Cambiamos el estado, marcamos la partida terminada y se declara al ganador
    else {
      fin = true;
      estado = {terminado : true, ganador: estado.ganador};
    }
  }
  //Si la partida ha acabado, devolvemos el estado directamente, sino hacemos lo de siempre
  if (!fin){
    switch (jugadorMentiroso) {
      case estado.jugador1: estado.cartasJugador1.push.apply(estado.cartasJugador1, estado.cartasMesaReal); break;
      case estado.jugador2: estado.cartasJugador2.push.apply(estado.cartasJugador2, estado.cartasMesaReal); break;
      case estado.jugador3: estado.cartasJugador3.push.apply(estado.cartasJugador3, estado.cartasMesaReal); break;
      case estado.jugador4: estado.cartasJugador4.push.apply(estado.cartasJugador4, estado.cartasMesaReal); break;
      default: console.log("Error al poner cartas al mentiroso");
    }
    estado.cartasMesaReal = [];
    estado.valorCartasMesa = [];
    estado.mentiroso = false;
  }
  return estado;
}

function quitarCartas(cartas, cartasJugador){
  let hecho = false;
  for (let i = 0; i < cartas.length; i++){
    for (let j = 0; j < cartasJugador.length && !hecho; j++){
      if (cartas[i].palo === cartasJugador[j].palo && cartas[i].valor === cartasJugador[j].valor){
        cartasJugador.splice(j,1);
        hecho = true;
      }
    }
    hecho = false;
  }
  return (cartasJugador.length === 0);
}

function actualizarEstado(estado, accion, valorIndicado){
  //Si nadie ha ganado
  if (estado.ganador === ""){
    let sinCartas = false;
    //Quitar las cartas del jugador que ha realizado la Accion
    switch (estado.turnoJugador) {
      case estado.jugador1: sinCartas = quitarCartas(accion, estado.cartasJugador1); break;
      case estado.jugador2: sinCartas = quitarCartas(accion, estado.cartasJugador2); break;
      case estado.jugador3: sinCartas = quitarCartas(accion, estado.cartasJugador3); break;
      case estado.jugador4: sinCartas = quitarCartas(accion, estado.cartasJugador4); break;
      default: console.log("Error al quitar cartas del turno");
    }
    if (sinCartas){
      estado.ganador = estado.turnoJugador;
    }
    //Cambiar turno
    let indice = estado.ordenJugadores.indexOf(estado.turnoJugador) + 1;
    if (indice === 4){
      indice = 0;
    }
    estado.turnoJugador = estado.ordenJugadores[indice];
    //Reiniciamos el estado de mentiroso
    estado.mentiroso = false;
    //Poner cartas con el valor indicado en la mesa
    for (let i = 0; i < accion.length; i++){
      estado.valorCartasMesa.push(valorIndicado);
      estado.cartasMesaReal.push(accion[i]);
      //Si alguna carta selecciona no tiene el valor indicado, es mentiroso
      if (accion[i].valor !== valorIndicado){
        estado.mentiroso = true;
      }
    }
  }
  //Cambiamos el estado, marcamos la partida terminada y se declara al ganador
  else{
    estado = {terminado : true, ganador: estado.ganador};
  }
  return estado;
}

function repartirCartasyJugadores(estado){
  let mazo = [];
  let palos = ["S", "H", "C", "D"];
  let valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  let i = 0;
  let j = 0;
  for(i = 0; i < palos.length; i++){
		for(j = 0; j < valores.length; j++){
			let carta = {palo: palos[i], valor: valores[j]};
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

app.put("/quitarRepetidas",  passport.authenticate('basic', {session: false}), (request, response) =>{
  daop.existePartida(request.body.idPartida, (err, result) =>{
    if(err){
      response.status(404);
      response.end();return;
    }
    daop.getPartida(request.body.idPartida, (err, partida) => {
      if(err){
        response.status(404);
        response.end();return;
      }
      let jugador = request.body.jugador;
      let estado = JSON.parse(partida.estado);
      if (estado.turnoJugador === jugador){
        let cartas = request.body.cartas;
        let sinCartas = false;
        switch (estado.turnoJugador) {
          case estado.jugador1: sinCartas = quitarCartas(cartas, estado.cartasJugador1); break;
          case estado.jugador2: sinCartas = quitarCartas(cartas, estado.cartasJugador2); break;
          case estado.jugador3: sinCartas = quitarCartas(cartas, estado.cartasJugador3); break;
          case estado.jugador4: sinCartas = quitarCartas(cartas, estado.cartasJugador4); break;
          default: response.status(404);response.end();return;
        }
        //Si al quitar las cartas son las ultimas, lo marcamos y pasamos el turno
        if (sinCartas){
          estado.ganador = estado.turnoJugador;
          //Cambiar turno
          let indice = estado.ordenJugadores.indexOf(estado.turnoJugador) + 1;
          if (indice === 4){
            indice = 0;
          }
          estado.turnoJugador = estado.ordenJugadores[indice];
          //Reiniciamos el estado de mentiroso
          estado.mentiroso = false;
        }
        partida.estado = estado;
        daop.actualizarEstado(request.body.idPartida, JSON.stringify(partida.estado),  (err, result) =>{
          if(err){
            response.status(404);
            response.end();return;
          }
          else{
            response.json({partida: partida});
          }
        });
      }
      else{
        response.json({error : "No puedes realizar una accion, no es tu turno"});
      }
    });
  })
});

let servidor = https.createServer(
  { key: clavePrivada, cert: certificado }, app);

servidor.listen(config.port, function(err){

});
