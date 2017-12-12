"use strict"

const config = require("./config");



class DAOOpciones{
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
     * @param {string} id Identificador de la respuesta
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    getOpciones(idPregunta, callback) {
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query(
                "SELECT * FROM " + config.database +".opciones WHERE idPregunta=?;",
                [idPregunta],
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

    crearOpcion(textoOpcion, idPregunta, callback){
      this.pool.getConnection((err, connection) =>{
          if(err){
              callback(err); return;
          }
          else{
            connection.query(
                "INSERT INTO " + config.database + ".opciones VALUES (NULL, ?, ?);",
                [textoOpcion, idPregunta],
                (err, result) =>{
                    connection.release();
                    if(err){
                        callback(err);
                    }
                    else {
                      callback(null, result);
                    }
                });
          }
        });
    }

    setRespuesta(idPregunta, user, idOpcion, callback){
      this.pool.getConnection((err, connection) => {
        if(err){
          callback(err);
        }
        else{
          connection.query("INSERT INTO preguntasusers VALUES (?, ?, ?);",
          [idPregunta, user, idOpcion],
          (err, result) => {
            connection.release();
            if (err){
              callback(err);
            }
            else {
              callback(null);
            }
          });
        }
      });
    }

  }

module.exports = {
    DAOOpciones: DAOOpciones
}
