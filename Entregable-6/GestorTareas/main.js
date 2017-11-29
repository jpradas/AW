const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoTasks = require("./dao_tasks");
const taskUtils = require("./task_utils");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

const daoT = new daoTasks.DAOTasks(pool);


const ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));

app.use((request, response, next) => {
    console.log(`Recibida petición ${request.method} ` +
    `en ${request.url} de ${request.ip}`);
    next();
});

app.get("/", (request,response) =>{
  daoT.getAllTasks("usuario@ucm.es", (err, taskList)=>{
    if(err){
      next(err);return;
    }
    console.log(taskList);
    response.status(200);
    response.render("tasks", { tasks: taskList });
    //resp
  });
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
      console.log(taskList);
      response.status(200);
      response.render("tasks", { tasks: taskList });
      //response.end();
  	});
    //response.end();
});

app.get("/deleteCompleted", (request, response) => {
  response.status(404);
  response.end();
});
