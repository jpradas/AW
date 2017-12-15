"use strict"

const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const mysql = require("mysql");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const flash = require("express-flash")
const config = require("./config");
const daoUsers = require("./daoUsers");
const daoAmigos = require("./daoAmigos");
const daoImagenes = require("./daoImg");
const daoPreguntas = require("./daoPreguntas")
const daoOpciones = require("./daoOpciones")
const underscore = require("underscore");
const expressValidator = require("express-validator");

const upload = multer({ storage: multer.memoryStorage() });

const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

const MySQLStore = mysqlSession(session);

const sessionStore = new MySQLStore({
  host: "localhost",
  user: "root",
  password: "",
  database: "facebluff"
});

const middlewareSession = session({
	saveUninitialized: false,
	secret: "sesion-user",
	resave: false,
  store: sessionStore
});

const app = express();

const ficherosEstaticos = path.join(__dirname, "public");

const daou = new daoUsers.DAOusers(pool);
const daoa = new daoAmigos.DAOamigos(pool);
const daoi = new daoImagenes.DAOimg(pool);
const daoP = new daoPreguntas.DAOPreguntas(pool);
const daoO = new daoOpciones.DAOOpciones(pool);

app.use(express.static(ficherosEstaticos));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(middlewareSession);
app.use(flash());
app.use(expressValidator());


function setFlash(request, msg, type){
  request.session.flashMsg = msg;
  request.session.type = type;
}

function clearFlash(request){
  request.session.flashMsg = undefined;
  request.session.type = undefined;
}

function isMessage(request){
  let mensaje = "";
  if(request.session.flashMsg !== undefined){
    mensaje = { text: request.session.flashMsg, type: request.session.type }
    clearFlash(request);
  }
  return mensaje;
}

function userExists(request, response, next){
	daou.isUserCorrect(request.body.email, request.body.password, (err, result)=>{
		if(err){
			next(err);return;
		}
		if(result){
			next();
		}else{//mostrar alerta de usuario no encontrado
      setFlash(request, "Usuario inexistente en base de datos", "danger");
      response.redirect("login.html");
      //response.render("login", {message: request.session.flashMsg});
		}
	});
}

function auth(request, response, next){
  if(request.session.email){
    app.locals.userEmail = request.session.email;
    app.locals.puntos = request.session.puntos;
    next();
  }else{
    response.status(403);
    setFlash(request, "Debes iniciar sesion para acceder a tu perfil", "danger");
    response.redirect("login.html");
    //response.render("login", {message: "Debes iniciar sesión para acceder a tu perfil"});
  }
}

function initSession(request, response, next){
    daou.getUser(request.body.email, (err, user)=>{
      if(err){
        next(err);return;
      }
      request.session.email = user.email;
      request.session.password = user.password;
      request.session.puntos = user.puntos;
      next();
    });
}

app.post("/login.html", userExists, initSession, (request, response, next) =>{ //necesitamos un middleware intermedio que compruebe los datos de sesión para saber si estamos logueados
  response.redirect("profile.html");
});

app.get("/login.html", (request, response, next)=>{
  let mensaje = isMessage(request);
  response.render("login", { message: mensaje });
})


function datosCorrectos(request, response, next){
  if(request.body.email === "" || request.body.password === ""){
    setFlash(request, "Es obligatorio rellenar el email y la contraseña", "danger");
    response.redirect("new_user.html");
  }else{
    next();
  }
}

function calcularEdad(fecha) {
    var hoy = new Date();
    var cumpleanos = new Date(fecha);
    var edad = hoy.getFullYear() - cumpleanos.getFullYear();
    var m = hoy.getMonth() - cumpleanos.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }
    return edad;
}

function insertUser(request, response, next){
  daou.isUserCorrect(request.body.email, request.body.password, (err, result)=>{
		if(err){
			next(err);return;
		}
		if(result){//mostrar alerta de usuario existente
      setFlash(request, "Usuario existente en base de datos", "danger");
      response.redirect("login.html");
		}else{
      let img; let edad;
      if(request.file){
        img = request.file.buffer;
      }else{
        img = null;
      }
      if(request.body.fecha_de_nacimiento){
        edad = calcularEdad(request.body.fecha_de_nacimiento);
      }
      else{
        edad = null;
      }
      let usuario = {email: request.body.email, password: request.body.password, nombre_completo: request.body.nombre_completo,
                      sexo: request.body.sexo, edad: edad, imagen_perfil: img }
      daou.setUser(usuario, (err, result)=>{
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


app.post("/new_user.html", upload.single("imagen_perfil"), datosCorrectos, insertUser, initSession, (request, response, next) =>{
  response.redirect("profile.html");
});

app.get("/new_user.html", (request, response, next)=>{
  let mensaje = isMessage(request);
  response.render("new_user", { message: mensaje });
});


app.get("/profile.html", auth, (request, response, next) =>{
  let fotos = "";
  daou.getUser(request.session.email, (err, user) =>{
		if(err){
			next(err);return;
		}
    daoi.getImgbyUser(request.session.email, (err, imgs)=>{
      if(err){
        next(err);return;
      }
      if(imgs.length !== 0){
        fotos = imgs;
      }
      let mensaje = isMessage(request);
      response.status(200);
      response.render("profile", { usuario: user, modificar: "si", message: mensaje, fotos: fotos});
    });
	});
})

app.post("/profile.html", auth, (request, response, next)=>{
  let fotos = "";
  daou.getUser(request.body.nombre, (err, user) =>{
		if(err){
			next(err);return;
		}
    daoi.getImgbyUser(request.body.nombre, (err, imgs)=>{
      if(err){
        next(err);return;
      }
      if(imgs.length !== 0){
        fotos = imgs;
      }
      let mensaje = isMessage(request);
      response.status(200);
      response.render("profile", { usuario: user, modificar: "no", message: mensaje, fotos: fotos});
    });
	});
})

app.get("/amigos.html",auth, (request, response, next) =>{
  daoa.getAmigos(request.session.email, (err, rows) =>{
    if(err){
      next(err);return;
    }
    let amigos=[]; let pendientes=[]; let solicitudes=[];
    crearArrays(amigos, pendientes, solicitudes, rows);
    let mensaje = isMessage(request);
    response.status(200);
    response.render("list_amigos" , {amigos: amigos, pendientes: pendientes, solicitudes: solicitudes, message: mensaje});
  });
})


function crearArrays(amigos, pendientes, solicitudes, rows){
    rows.forEach(row =>{
      if(row.confirmado === 0){
        solicitudes.push(row);
      }
      if(row.confirmado === 1){
        amigos.push(row);
      }
      if(row.confirmado === 2){
        pendientes.push(row);
      }
    });
}

app.post("/amigos.html", auth, (request, response, next) =>{
    daou.findUsersPattern(request.body.busca, request.session.email, (err, usuarios)=>{
      if(err){
        next(err);return;
      }
      response.status(200);
      response.render("search" , {buscados: usuarios, busqueda: request.body.busca});
    })
})


app.post("/solicitud.html", auth, (request, response, next)=>{
  daoa.enviarSolicitud(request.session.email, request.body.email, (err, result)=>{
    if(err){
      next(err);return;
    }
    if(result === true){
      //TO DO insertar mensaje flash de peticion enviada
      setFlash(request, "Peticion de amistad enviada", "info");
    }
    else{
      setFlash(request, "Oops, ha ocurrido algo raro. Error al enviar solicitud", "danger");
    }
    response.redirect("amigos.html");
  })
})

app.post("/confirmar_amigo.html", (request, response, next) =>{
  if(request.body.accion === "1"){ //aceptamos amigo
    daoa.aceptarSolicitud(request.session.email, request.body.email, (err, result)=>{
      if(err){
        next(err);return;
      }
      if(result === true){
        setFlash(request, "Amigo aceptado", "info");
        //mensaje flash de aceptado y volvemos a cargar Amigos  TO DO que la pagina de amigos proyecte mensajes flash
      }else{
        setFlash(request, "Oops, algo raro ha ocurrido. Error al confirmar amigo", "danger");
        //mensaje flash de cagada y cargamos amigos de nuevo
      }
      response.redirect("amigos.html");
    })
  }else{ //rechazamos
    daoa.rechazarSolicitud(request.session.email, request.body.email, (err, result)=>{
      if(err){
        next(err);return;
      }
      if(result === true){
        setFlash(request, "Amigo rechazado", "info");
      }else{
        setFlash(request, "Oops, algo raro ha ocurrido. Error al rechazar amigo.", "danger");
      }
      response.redirect("amigos.html");
    })
  }
});

app.get("/logout.html", (request, response, next)=>{
  request.session.destroy();
  response.status(200);
	response.redirect("login.html");
})

app.get("/modify_profile.html", (request, response, next) =>{
  daou.getUser(request.session.email, (err, user)=>{
    if(err){
      next(err);return;
    }
    response.status(200);
    response.render("modify_profile", { usuario: user });
  });
})

app.post("/modify_profile.html", upload.single("imagen_perfil"), auth, (request, response, next)=>{
  let query; let array;
  if(request.file){
     query = "UPDATE " + config.database + ".users SET nombre_completo=?, edad=?, sexo=?, imagen=? WHERE email=?;";
     array = [request.body.nombre, request.body.edad, request.body.sexo, request.file.buffer, request.session.email];
  }else{
     query = "UPDATE " + config.database + ".users SET nombre_completo=?, edad=?, sexo=? WHERE email=?;";
     array = [request.body.nombre, request.body.edad, request.body.sexo, request.session.email];
  }
  daou.modifyUser(query, array, (err, result)=>{
    if(err){
      next(err);return;
    }
    response.redirect("profile.html");
  })
})


app.get("/imagen_perfil/:email", (request, response)=>{
  let email = request.params.email;
  daou.obtenerImg(email, (err, img)=>{
    if (err || img === null){
      let imagen = __dirname.concat("/public/img/NoProfile.png");
      response.sendFile(imagen);
    }else{
      response.end(img);
    }
  })
})

app.get("/preguntas.html", auth, (request, response, next) =>{
  daoP.getPreguntasAleatorias((err, result) =>{
    if (err){
      next(err);
    }
    let mensaje = isMessage(request);
    response.status(200);
    response.render("preguntas", { preguntas : result, message: mensaje });
  });
})

app.post("/pregunta_:id", (request, response, next) =>{
  let idPregunta = request.params.id;
  let contestado;
  daoP.getPregunta(idPregunta, (err, pregunta) =>{
    if (err){
      next(err);
    }
    else {
      daoP.getPreguntaContestadaByUser(idPregunta, request.session.email, (err, opcion) =>{
        if (err){
          next(err);
        }
        else {
          if(opcion === false){
              contestado = false;
          }
          else{
              contestado = true;
          }
            daoa.getAmigosContestanPregunta(request.session.email, idPregunta, (err, amigo) => {
                if (err){
                  next(err);
                }
                else {
                  response.render("vistaPregunta", {preg : pregunta, amigos: amigo, contestado: contestado, opcion: opcion});
                }
              });
            }
        });
    }
  });
});

app.post("/contestarPregunta", auth, (request, response, next) =>{
  daoO.getOpciones(request.body.idPregunta, (err, result) =>{
    if (err){
      next(err);
    }
    else {
      response.render("responderPregunta", {idPregunta : request.body.idPregunta, pregunta: request.body.pregunta, opciones: result});
    }
  })
})

app.post("/contestacion", (request, response, next) =>{
  if (request.body.idOpcion === "otra"){
    daoO.crearOpcion(request.body.otraResp, request.body.idPregunta, (err, result) =>{
      if (err){
        next(err);
      }
      else {
        daoO.setRespuesta(request.body.idPregunta, request.session.email, result.insertId,(err) =>{
          if (err){
            next(err);
          }
          else {
            setFlash(request, "Pregunta contestada con exito", "info");
            response.redirect("preguntas.html");
          }
        });
      }
    });
  }
  else{
    daoO.setRespuesta(request.body.idPregunta, request.session.email, request.body.idOpcion,(err) =>{
      if (err){
        next(err);
      }
      else {
        setFlash(request, "Pregunta contestada con exito", "info");
        response.redirect("preguntas.html");
      }
    });
  }
})

app.post("/nuevaPregunta", auth, (request, response) =>{
  response.render("formPregunta");
})

app.post("/formPregunta", auth, (request, response) => {
  response.render("crearPregunta", {num : request.body.numOpciones, preg: request.body.pregunta});
});

app.post("/crearPregunta", auth, (request, response, next) =>{
  console.log(request.body.pregunta);
  console.log(request.body.opcion);
  daoP.crearPregunta(request.body.pregunta, request.body.opcion, (err, id) => {
    console.log("no");
    if (err){
      next(err);
    }
    else {
      setFlash(request, "Pregunta creada con exito", "info");
      response.redirect("preguntas.html")
    }
  });
  
})


app.post("/opcionesAdivinar", auth, (request, response, next) =>{
  daoO.getOpcionesAdivinar(request.body.idPregunta, request.body.opcIniciales, request.body.opcContestada, (err, result) =>{
    if (err){
      next(err);
    }
    else {
      let opciones = underscore.shuffle(result);
      response.render("adivinarPregunta", {idPregunta : request.body.idPregunta, pregunta: request.body.pregunta, opciones: opciones, amigo: request.body.nombre});
    }
  })
})


app.post("/adivinar", (request, response, next) =>{
  daoP.compararRespuestas(request.body.idPregunta, request.body.amigo, request.body.idOpcion, (err, exito) =>{
    if (err){
      next(err);
    }
    else {
      daoP.setAdivinar(request.body.idPregunta, request.session.email, request.body.amigo, exito, (err, result) => {
        if (err){
          next(err);
        }
        else if(exito){
          request.session.puntos += 50;
          daou.actualizarPuntos(request.session.email, request.session.puntos, (err) =>{
            if (err){
              request.session.puntos -= 50;
              next(err);return;
            }
            else {
              setFlash(request, "Respuesta adivinada con exito", "info");
              response.redirect("preguntas.html");
            }
          })
        }
        else {
          setFlash(request, "Respuesta no adivinada, mala suerte", "info");
          response.redirect("preguntas.html");
        }
      });
    }
  });
})


function havePoints(request, response, next){
  if(request.session.puntos >= 100){
    next();
  }else{
    setFlash(request, "No tienes puntos suficientes para subir una foto", "danger");
    response.redirect("profile.html");
  }
}


app.get("/upload_photos.html", auth, havePoints, (request, response, next)=>{
  let mensaje = isMessage(request);
  response.render("upload_photos", {message: mensaje});
});


function theresImg(request, response, next){
  if(request.file){
    next();
  }else{
    setFlash(request, "No ha seleccionado ninguna imagen", "danger");
    response.redirect("upload_photos.html");
  }
}

app.post("/upload_photos", upload.single("foto"), auth, theresImg, (request, response, next)=>{
    daoi.setImg(request.file, request.session.email, (err, result)=>{
      if (err) {
        next(err);return;
      }
      if(result){
        request.session.puntos -= 100;
        daou.actualizarPuntos(request.session.email, request.session.puntos, (err)=>{
          if(err){
            request.session.puntos += 100;
            next(err);return;
          }
          setFlash(request, "Foto subida con exito", "info");
          response.redirect("profile.html");
        })
      }else{
        setFlash(request, "Oops, no se pudo insertar la imagen. Reintentalo", "danger");
        response.redirect("profile.html");
      }
    })
});

app.get("/fotos/:filename", (request, response, next)=>{
  daoi.getImgbyFilename(request.params.filename, (err, result)=>{
    if(err){
      next(err);return;
    }
    response.end(result);
  })
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
	//codigo 404: Error Not Found
	response.status(404);
	response.render("error-404", {
		mensaje: error.message,
		pila: error.stack
	});
})

app.listen(config.port, ()=>{
	console.log(`Escuchando del puerto ${config.port}`);
})
