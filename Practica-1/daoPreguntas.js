"use strict"

const config = require("./config");



class DAOPreguntas{
/**
     * Inicializa el DAO de usuarios.
     *
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Determina si un determinado usuario aparece en la BD con la contraseña
     * pasada como parámetro.
     *
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando, por un lado, el objeto Error (si se produce, o null en caso contrario)
     * y, por otro lado, un booleano indicando el resultado de la operación
     * (true => el usuario existe, false => el usuario no existe o la contraseña es incorrecta)
     * En caso de error error, el segundo parámetro de la función callback será indefinido.
     *
     * @param {string} filename Identificador de la foto
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */

    getPreguntasAleatorias(callback) {
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query(
                "SELECT * FROM " + config.database +".preguntas ORDER BY RAND() LIMIT 5;",
                (err, result)=>{
                    connection.release();
                    if(err){
                        callback(err);
                    }
                    else{
                        callback(null, result);
                    }
                }
            );
        })
    }

  //Saca los usuarios que han contestado a la pregunta, no usada de momento, no borrar
    getPreguntaUserByID(id, callback) {
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query("SELECT * FROM preguntas JOIN preguntasusers ON preguntas.id=preguntasusers.id_pregunta WHERE preguntas.id=?;",
                [id],
                (err, result)=>{
                    connection.release();
                    if(err){
                        callback(err);
                    }
                    else{
                        callback(null, result);
                    }
                }
            );
        })
    }
    getPregunta(id, callback) {
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query("SELECT * FROM preguntas WHERE id=?;",
                [id],
                (err, preg)=>{
                    connection.release();
                    if(err){
                        callback(err);
                    }
                    else{
                      callback(null, preg[0]);
                    }
                }
            );
        })
    }

      //Saca si el usuario ha contestado a la pregunta
    getPreguntaContestadaByUser(id, user, callback) {
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query("SELECT * FROM preguntas JOIN preguntasusers ON preguntas.id=preguntasusers.id_pregunta JOIN opciones ON preguntasusers.id_opcion=opciones.id WHERE preguntas.id=? AND preguntasusers.user=?;",
                [id, user],
                (err, result)=>{
                    connection.release();
                    if(err){
                        callback(err);
                    }
                    else{
                      if(result.length > 0){
                          callback(null, result[0]);
                      }
                      else{
                          callback(null, false);
                      }

                    }
                }
            );
        })
    }

    crearPregunta(texto,opciones,callback){
      this.pool.getConnection((err, connection) =>{
          if(err){
              callback(err); return;
          }
          connection.query(
              "INSERT INTO " + config.database + ".preguntas VALUES (NULL, ?, ?);",
              [texto, opciones.length],
              (err, result)=>{
                  if(err){
                      callback(err);
                  }
                  else{
                    for (let i = 0; i < opciones.length; i++){
                      connection.query(
                          "INSERT INTO " + config.database + ".opciones VALUES (NULL, ?, ?);",
                          [opciones[i], result.insertId],
                          (err, result)=>{
                              if(err){
                                  callback(err);
                              }
                          });
                    }
                    connection.release();
                    callback(null);
                  }
              });
        });
      }

      compararRespuestas(idPregunta, userComparar, idOpcion, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query(
                "SELECT * FROM " + config.database + ".preguntasusers WHERE id_pregunta=? AND user=? AND id_opcion=?;",
                [idPregunta, userComparar, idOpcion],
                (err, result)=>{
                  connection.release();
                    if(err){
                        callback(err);
                    }
                    else{
                      if(result.length > 0){
                        callback(null, true);
                      }
                      else {
                        callback(null, false);
                      }
                    }
                });
          });
      }

      setAdivinar(idPregunta, userAdivina, userRespondio, acierto, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query(
                "INSERT INTO " + config.database + ".adivinar VALUES (?, ?, ?, ?);",
                [idPregunta, userAdivina, userRespondio, acierto],
                (err, result)=>{
                  connection.release();
                    if(err){
                        callback(err);
                    }
                    else{
                      callback(null);
                    }

                });
          });
      }

      getAdivinar(callback){
        
      }
  }

module.exports = {
    DAOPreguntas: DAOPreguntas
}
