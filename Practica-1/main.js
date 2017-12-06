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

function clearFlash(request){
  request.session.flashMsg = undefined;
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
    clearFlash(request);
  }
  response.render("login", mensaje);
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

app.get("/new_user.html", (request, response, next)=>{
  let mensaje = {message: ""};
  if(request.session.flashMsg !== undefined){
    mensaje = {message: request.session.flashMsg};
    clearFlash(request);
  }
  response.render("new_user", mensaje);
});

function auth(request, response, next){
  if(request.session.email === undefined){
    response.status(403);
    setFlash(request, "Debes iniciar sesion para acceder a tu perfil");
    response.redirect("login.html");
    //response.render("login", {message: "Debes iniciar sesión para acceder a tu perfil"});
  }else{
    next();
  }
}

app.get("/profile.html", auth, (request, response, next) =>{
  servUser(request, response);
})

app.get("/amigos.html", auth, (request, response, next) =>{
  daoa.getAmigos(request.session.email, (err, rows) =>{
    if(err){
      next(err);return;
    }
    daou.getUser(request.session.email, (err, user) =>{ //podriamos cargar los datos del usuario desde la session
      if(err){
        next(err);return;
      }
      response.status(200);
      response.render("list_amigos" , {amigos: rows, usuario: user});
    });
  });
})

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


app.post("/solicitud", auth, (request, response, next)=>{
  daoa.enviarSolicitud(request.session.email, request.body.nombre, (err, result)=>{
    if(result === true){
      //enviar mensaje de que se ha enviado la solicitud
    }
  })
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
			next(err);return;
		}
		response.status(200);
		response.render("profile", { usuario: user });
	});
}


app.get("/modify_profile", (request, response, next) =>{
  daou.getUser(request.session.email, (err, user)=>{
    if(err){
      next(err);return;
    }
    response.status(200);
    response.render("modify_profile", { usuario: user });
  });
})

app.post("/client_change", auth, (request, response, next)=>{
  daou.modifyUser(request.session.email, request.body, (err, result)=>{
    if(err){
      next(err);return;
    }
    response.redirect("profile.html");
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
	//codigo 500: Internal server error
	response.status(404);
	response.render("error-404", {
		mensaje: error.message,
		pila: error.stack
	});
})

app.listen(config.port, ()=>{
	console.log(`Escuchando del puerto ${config.port}`);
})
