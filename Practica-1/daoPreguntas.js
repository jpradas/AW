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
     * Devuelve preguntas aleatorias para visualizar
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

    /**
     * Saca los usuarios que han contestado a la pregunta
     * @param {Integer} id Id de la pregunta
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    getPreguntaUserByID(id, callback) {
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query(
                "SELECT * FROM preguntas JOIN preguntasusers ON preguntas.id=preguntasusers.id_pregunta WHERE preguntas.id=?;",
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

    /**
     * Extrae la pregunta segun el id
     * @param {Integer} id Id de la pregunta
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
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

    /**
     * Extrae si el usuario ha contestado a la pregunta
     * @param {Integer} id Id de la pregunta
     * @param {String} user email del usuario
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
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

    crearPregunta(texto, opciones, callback){
      this.pool.getConnection((err, connection) =>{
          if(err){
              callback(err); return;
          }
          connection.query(
              "INSERT INTO " + config.database + ".preguntas VALUES (NULL, ?, ?);",
              [texto, opciones],
              (err, result)=>{
                  connection.release();
                  if(err){
                    callback(err);
                  }
                  callback(null, result.insertId);
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

  }

module.exports = {
    DAOPreguntas: DAOPreguntas
}
