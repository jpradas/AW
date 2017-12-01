"use strict";

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoTasks = require("./dao_tasks");
const taskUtils = require("./task_utils");
const expSesion = require("express-session");
const mysqlSession = require("express-mysql-session");
const daoUser = require("./dao_users");

const MySQLStore = mysqlSession(expSesion);
const sessionStore = new MySQLStore({
  host: "localhost",
  user: "root",
  password: "",
  database: "tareas"
}); 

const middlewareSession = expSesion({
  saveUninitialized: false,
  secret: "foobar34",
  resave: false,
  store: sessionStore
});



const app = express();

const ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));
app.use(middlewareSession); 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

const daoT = new daoTasks.DAOTasks(pool);
const daoU = new daoUser.DAOUsers(pool);

app.use((request, response, next) => {
    console.log(`Recibida petición ${request.method} ` +
    `en ${request.url} de ${request.ip}`);
    next();
});

app.get("/", (request,response) =>{
    response.status(200);
    response.redirect("/login.html");
});

app.listen(config.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});

app.get("/tasks.html", (request,response) =>{

    daoT.getAllTasks("usuario@ucm.es", (err, taskList)=>{
  		if(err){
  			next(err);return;
  		}
      //console.log(taskList);
      response.status(200);
      response.render("tasks", { tasks: taskList });
  	});

});

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/addTask", (request, response) => {
  let task = taskUtils.createTask(request.body.taskText);

  daoT.insertTask("usuario@ucm.es", task, (err, result) => {
    if (err){
      response.status(404);
      response.end();
    }
    else{
      response.status(200);
      response.redirect("/tasks.html");
    }
  });
});

app.post("/finish", (request, response) => {
  let id = request.body.id;
  daoT.markTaskDone(id, (err, result) => {
    if (err){
      response.status(404);
      response.end();
    }
    else{
      response.status(200);
      response.redirect("/tasks.html");
    }
  });
});

app.get("/deleteCompleted", (request, response) => {
  daoT.deleteCompleted("usuario@ucm.es", (err, result) => {
    if (err){
      response.status(404);
      response.end();
    }
    else{
      response.status(200);
      response.redirect("/tasks.html");
    }
  });
});

app.get("/login.html", (request, response) => {
  response.status(200);
  response.render("login", {errorMsg: null});
});

app.post("/login", (request, response) =>{
  daoU.isUserCorrect(request.body.mail, request.body.pass, (err, result) =>{
    if (err || !result){
      let error = "Dirección de correo y/o contraseña no válidos";
      response.render("login", {errorMsg: error});
    }
    else {
      request.session.currentUser = request.body.mail;
      response.status(200);
      response.redirect("/tasks.html");
    }
  })
})

app.get("/logout", (request, response) => {
  request.session.destroy();
  response.redirect("/login.html");
})