"use strict";

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoTasks = require("./dao_tasks");
const taskUtils = require("./task_utils");

const app = express();

const ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

const daoT = new daoTasks.DAOTasks(pool);

app.use((request, response, next) => {
    console.log(`Recibida petición ${request.method} ` +
    `en ${request.url} de ${request.ip}`);
    next();
});

app.get("/", (request,response) =>{
    response.status(200);
    response.redirect("/tasks.html");
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
