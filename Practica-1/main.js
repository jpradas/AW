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
const daoRespuestas = require("./daoRespuestas")

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
const daoR = new daoRespuestas.DAORespuestas(pool);

app.use(express.static(ficherosEstaticos));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
//Necesito Exp
app.use(cookieParser());
app.use(middlewareSession);
//Necesito Exp
app.use(flash());


function setFlash(request, msg){
  request.session.flashMsg = msg;
}

function clearFlash(request){
  request.session.flashMsg = undefined;
}

function isMessage(request){
  let mensaje = "";
  if(request.session.flashMsg !== undefined){
    mensaje = request.session.flashMsg;
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
      setFlash(request, "Usuario inexistente en base de datos");
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
    setFlash(request, "Debes iniciar sesion para acceder a tu perfil");
    response.redirect("login.html");
    //response.render("login", {message: "Debes iniciar sesión para acceder a tu perfil"});
  }
}

function initSession(request, response, next){
		request.session.email = request.body.email;
		request.session.password = request.body.password;
    request.session.puntos = 0;
    //response.locals.userEmail = request.body.email;
    //response.locals.puntos = 0;
		next();
}

app.post("/login.html", userExists, initSession, (request, response, next) =>{ //necesitamos un middleware intermedio que compruebe los datos de sesión para saber si estamos logueados
  response.redirect("profile.html");
});

app.get("/login.html", (request, response, next)=>{
  let mensaje = "";
  mensaje = isMessage(request);
  response.render("login", { message: mensaje });
})


function datosCorrectos(request, response, next){
  if(request.body.email === "" || request.body.password === ""){
    setFlash(request, "Es obligatorio rellenar el email y la contraseña");
    response.redirect("new_user.html");
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
		}else{
      let usuario = {email: request.body.email, password: request.body.password, nombre_completo: request.body.nombre_completo,
                      sexo: request.body.sexo, fecha_de_nacimiento: request.body.fecha_de_nacimiento, imagen_perfil: request.file }
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
  let mensaje = "";
  mensaje = isMessage(request);
  response.render("new_user", { message: mensaje });
});


app.get("/profile.html", auth, (request, response, next) =>{
  daou.getUser(request.session.email, (err, user) =>{
		if(err){
			next(err);return;
		}
		response.status(200);
		response.render("profile", { usuario: user, modificar: "si" });
	});
})

//TO DO post del perfil, significa que alguien accede a tu perfil.
app.post("/profile.html", auth, (request, response, next)=>{
  daou.getUser(request.body.nombre, (err, user) =>{
		if(err){
			next(err);return;
		}
		response.status(200);
		response.render("profile", { usuario: user, modificar: "no" });
	});
})

app.get("/amigos.html",auth, (request, response, next) =>{
  daoa.getAmigos(request.session.email, (err, rows) =>{
    if(err){
      next(err);return;
    }
    daou.getUser(request.session.email, (err, user) =>{ //podriamos cargar los datos del usuario desde la session
      if(err){
        next(err);return;
      }
      let amigos=[]; let pendientes=[]; let solicitudes=[]; let mensaje = "";
      crearArrays(amigos, pendientes, solicitudes, rows);
      mensaje = isMessage(request);
      response.status(200);
      response.render("list_amigos" , {amigos: amigos, pendientes: pendientes, solicitudes: solicitudes, usuario: user, message: mensaje});
    });
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
      daou.getUser(request.session.email, (err, user) =>{ //podriamos cargar los datos del usuario desde la session
        if(err){
          next(err);return;
        }
        response.status(200);
        response.render("search" , {buscados: usuarios, usuario: user, busqueda: request.body.busca});
      });
    })
})


app.post("/solicitud.html", auth, (request, response, next)=>{
  daoa.enviarSolicitud(request.session.email, request.body.email, (err, result)=>{
    if(err){
      next(err);return;
    }
    if(result === true){
      //TO DO insertar mensaje flash de peticion enviada
      setFlash(request, "Peticion de amistad enviada");
    }
    else{
      setFlash(request, "Oops, ha ocurrido algo raro. Error al enviar solicitud");
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
        setFlash(request, "Amigo aceptado");
        //mensaje flash de aceptado y volvemos a cargar Amigos  TO DO que la pagina de amigos proyecte mensajes flash
      }else{
        setFlash(request, "Oops, algo raro ha ocurrido. Error al confirmar amigo");
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
        setFlash(request, "Amigo rechazado");
      }else{
        setFlash(request, "Oops, algo raro ha ocurrido. Error al rechazar amigo.");
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
  let usuario = {nombre: request.body.nombre, edad: request.body.edad,
                  sexo: request.body.sexo, imagen_perfil: request.file };
  daou.modifyUser(request.session.email, usuario, (err, result)=>{
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
    else {
      response.render("preguntas", {preguntas : result});
    }
  });
})

app.post("/pregunta/:id", (request, response) =>{
  let id = request.params.id;
  daoP.getPreguntasByID(id, (err, preguntas) =>{
    if (err){
      response.status(404);
      response.end();
    }
    else {
      daoa.getAmigos(preguntas[0].user, (err, amigos) => {
        if (err){
          response.status(404);
          response.end();
        }
        else{
          //let obj = {pregunta : preguntas, amigos: amigos};
          //console.log(obj);
          //response.render("vistaPregunta", {pregunta : preguntas, amigos: amigos});
          response.render("vistaPregunta", {preg : preguntas, amigos: amigos});
        }
      });
    }
  });
})

app.post("/contestarPregunta", (request, response) =>{
  console.log(request.body.id);
  console.log(request.body.pregunta);
  daoR.getRespuestas(request.body.id, (err, result) =>{
    if (err){
      response.status(404);
      response.end();
    }
    else {
      console.log(result);
      response.render("responderPregunta", {pregunta: request.body.pregunta , respuesta: result});
    }
  })

})



app.post("/nuevaPregunta", (request, response) =>{
    response.render("crearPregunta");
})

app.post("/crearPregunta", (request, response) =>{
  let respuesta = {};
  respuesta.push(request.body.opcion1);
  respuesta.push(request.body.opcion2);
  respuesta.push(request.body.opcion3);
  respuesta.push(request.body.opcion4);
  console.log(respuesta);
  console.log(request.body.verdadero);
  
  switch(request.body.verdadero){
    case 1: respuesta.push()
    case 2:
    case 3:
    case 4:
  }
  //SIgo sin saber como hacer verdadero
  /*
  daoP.setPregunta(request.session.email, request.body.pregunta, respuesta, request.body.verdadero, (err, id) => {
    if (err){
      response.status(500);
      response.end();
    }
    else {

    }
  });
  */
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
