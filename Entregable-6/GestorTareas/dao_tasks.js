/**
* Proporciona operaciones para la gestión de tareas
* en la base de datos.
*/
class DAOTasks {
    /**
    * Inicializa el DAO de tareas.
    *
    * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
    * sobre la BD se realizarán sobre este pool.
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
        this.pool.getConnection((err, connection) =>{
          if(err){
              callback(err); return;
          }
          connection.query(
            //falta sacar tags
            "SELECT * FROM tareas.task WHERE user = ?",
            [email],
            (err, rows)=>{
                connection.release();
                if(err){
                    callback(err);
                }
                if(rows.length === 0){
                    callback(null, rows);
                }else{
                    callback(null, rows);
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
      let id = 37;
      this.pool.getConnection((err, connection) =>{
          if(err){
              callback(err); return;
          }
          connection.query(
            "INSERT INTO tareas.task VALUES (?,?,?,0)",
            [id, email, task.text],
            (err, result) =>{
              if(err){
                  connection.release();
                  callback(err);return;
              }
              else{
                  callback(null);
              }
          });
          connection.query(
            "INSERT INTO tareas.tag VALUES (?,?)",
            [id, task.tag],
            (err, result) =>{

              if(err){
                  connection.release();
                  callback(err);return;
              }
              else{
                  callback(null);
              }
          });
          connection.release();
      });

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
      this.pool.getConnection((err, connection) =>{
          if(err){
              callback(err); return;
          }
          connection.query(
            "UPDATE tareas.task AS t SET done = 1 WHERE t.id = ?",
            [idTask],
            (err, result) =>{
              connection.release();
              if(err){
                  callback(err);return;
              }
              else{
                  callback(null);
              }
          });
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
      this.pool.getConnection((err, connection) =>{
          if(err){
              callback(err); return;
          }
          connection.query(
            "SELECT id FROM tareas.task AS t WHERE t.user = ?",
            [email],
            (err, result) =>{
              if(err){
                  callback(err);return;
              }
              else{
                connection.query(
                  "DELETE FROM tareas.tag AS t WHERE t.id = ?",
                  [result],
                  (err, result) =>{
                    if(err){
                        callback(err);return;
                    }
                    else{
                        callback(null);
                    }
                });
              }
          });
          connection.query(
            "DELETE FROM tareas.task AS t WHERE t.user = ?",
            [email],
            (err, result) =>{
              if(err){
                  callback(err);return;
              }
              else{
                  callback(null);
              }
          });

          connection.release();
      });
    }
}

module.exports = {
  DAOTasks: DAOTasks
}
