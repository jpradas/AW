/**
 * ============================
 * Ejercicio entregable 3.
 * Funciones de orden superior.
 * ============================
 * 
 * Puedes ejecutar los tests ejecutando `mocha` desde el directorio en el que se encuentra
 * el fichero `tareas.js`.
 */
"use strict";

let listaTareas = [
  { text: "Preparar práctica PDAP", tags: ["pdap", "practica"] },
  { text: "Mirar fechas congreso", done: true, tags: [] },
  { text: "Ir al supermercado", tags: ["personal"] },
  { text: "Mudanza", done: false, tags: ["personal"] },
];

let prueba =[ 
  { text: "t1", done: true, tags: ["a1", "a2", "a3"] },
  { text: "t2", tags: ["a1", "a3"] },
  { text: "t3", done: false, tags: [] },
  { text: "t4", tags: ["a2", "a3"] },
  { text: "t5", done: true, tags: ["a5"] },
];

/**
 * Devuelve las tareas de la lista de entrada que no hayan sido finalizadas.
 */
function getToDoTasks(tasks) {
  let tareas = tasks.filter(t => t.done !== true);
  let texto = tareas.map(t => t.text);
  return texto;
}

/**
 * Devuelve las tareas que contengan el tag especificado
 */
function findByTag(tasks, tag) {
  let tareas = tasks.filter(t => t.tags.indexOf(tag) !== -1);
  return tareas;
}

/**
 * Devuelve las tareas que contengan alguno de los tags especificados
 */
function findByTags(tasks, tags) {
  //let ta = tags.some(t=>t.indexOf(t));
  //let tareas = tasks.some(t=> t.tags.indexOf(tags) !== -1)
  return tasks.filter(p => p.tags.some(t => t.indexOf(tags) > -1));
  //return tasks.filter(p => p.keys(tags).some(t => tasks.tags.indexOf(t) !== -1));
}

//console.log(findByTags(prueba, ["a1","a3"]));
//console.log(findByTags(listaTareas, ["personal", "pdap"]));
//console.log(findByTags(listaTareas, []));


/**
 * Devuelve el número de tareas finalizadas
*/
function countDone(tasks) {
  return tasks.reduce((acum, t) =>{
    if (t.done){
      acum++;
    }
    return acum;
  } ,0);
}


/**
 * Construye una tarea a partir de un texto con tags de la forma "@tag"
 */
function createTask(text) {
  let patron = /@/gi;
  let result = patron.exec(text);
  //let result = text.match(patron);
  //Funciona
  let nuevo = text.replace(patron, "");
  return [result, nuevo];
}

console.log(createTask("Esto es una cadena @de @texto"));

/*
  NO MODIFICAR A PARTIR DE AQUI
  Es necesario para la ejecución de tests
*/
module.exports = {
  getToDoTasks: getToDoTasks,
  findByTag: findByTag,
  findByTags: findByTags,
  countDone: countDone,
  createTask: createTask
}