"use strict";

/**
 * Proporciona operaciones para la gestión de tareas
 * en la base de datos.
 */
class DAOTasks {
    /**
     * Inicializa el DAO de tareas.
     *
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }


    /**
     * Devuelve todas las tareas de un determinado usuario.
     *
     * Este método devolverá (de manera asíncrona) un array
     * con las tareas de dicho usuario. Cada tarea debe tener cuatro
     * atributos: id, text, done y tags. El primero es numérico, el segundo
     * una cadena, el tercero un booleano, y el cuarto un array de cadenas.
     *
     * La función callback ha de tener dos parámetros: un objeto
     * de tipo Error (si se produce, o null en caso contrario), y
     * la lista de tareas (o undefined, en caso de error).
     *
     * @param {string} email Identificador del usuario.
     * @param {function} callback Función callback.
     */
    getAllTasks(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query(
                "SELECT * FROM task LEFT JOIN tag ON task.id = taskId WHERE task.user = ?; ",
                [email],
                (err, rows) => {
                    connection.release();
                    if(err){
                        callback(err);
                    }else{
                        let tasks = [];
                        let last=0;
                        let prev=-1;
                        rows.forEach(row => {
                            let tarea = {
                                id: row.id,
                                text: row.text,
                                done: row.done,
                                tags: []
                            };
                            if(last !== row.id){
                                last = row.id;
                                tarea.tags.push(row.tag);
                                tasks.push(tarea);
                                prev++;
                            }else{
                                if(tasks[prev].tags.lastIndexOf(row.tag) === -1){
                                    tasks[prev].tags.push(row.tag);
                                }
                            }
                        });
                        callback(null, tasks);
                    }
                }
            );
        });
    }

    /**
     * Inserta una tarea asociada a un usuario.
     *
     * Se supone que la tarea a insertar es un objeto con, al menos,
     * dos atributos: text y tags. El primero de ellos es un string con
     * el texto de la tarea, y el segundo de ellos es un array de cadenas.
     *
     * Tras la inserción se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la inserción, o null en caso contrario.
     *
     * @param {string} email Identificador del usuario
     * @param {object} task Tarea a insertar
     * @param {function} callback Función callback que será llamada tras la inserción
     */
    insertTask(email, task, callback) {
      if (task.text !== ''){
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query(
                "INSERT INTO tareas.task VALUES (NULL, ?, ?, 0)",
                [email, task.text],
                (err, rows) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }else{
                      task.tags.forEach(tag => {
                        connection.query(
                            "INSERT INTO tareas.tag VALUES (?,?)",
                            [rows.insertId, tag],
                            (err)=>{
                                if(err){
                                    connection.release();
                                    callback(err);
                                }else{
                                    callback(null);
                                }
                            }
                        );
                      });
                      connection.release();
                      callback(null);
                    }
                }
            );
        });
      }
      else {
        callback(null);
      }
    }

    /**
     * Marca la tarea indicada como realizada, estableciendo
     * la columna 'done' a 'true'.
     *
     * Tras la actualización se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la actualización, o null en caso contrario.
     *
     * @param {object} idTask Identificador de la tarea a modificar
     * @param {function} callback Función callback que será llamada tras la actualización
     */
    markTaskDone(idTask, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query(
                "UPDATE task SET done = 1 WHERE id = ?",
                [idTask],
                (err) => {
                    connection.release();
                    callback(err);
                }
            );
        });
    }

    /**
     * Elimina todas las tareas asociadas a un usuario dado que tengan
     * el valor 'true' en la columna 'done'.
     *
     * Tras el borrado se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la actualización, o null en caso contrario.
     *
     * @param {string} email Identificador del usuario
     * @param {function} callback Función llamada tras el borrado
     */
    deleteCompleted(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query(
                "DELETE FROM task WHERE user = ? AND done = 1",
                [email],
                (err) => {
                    connection.release();
                    callback(err);
                }
            );
        });
    }
}

module.exports = {
    DAOTasks: DAOTasks
}
