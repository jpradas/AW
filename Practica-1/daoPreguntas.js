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
                "SELECT * FROM " + config.database +".preguntas;",
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

    getPreguntasByID(id, callback) {
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query(
                "SELECT * FROM " + config.database +".preguntas WHERE id=?;",
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

    setPregunta(user, texto, respuesta, callback) {
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query(
                "INSERT INTO" + config.database + ".preguntas VALUES (NULL,?,?);",
                [texto, user],
                (err, result)=>{
                    if(err){
                        callback(err);
                    }
                    else{
                      respuesta.forEach(resp => {
                        connection.query("INSERT INTO respuestas VALUES (?, ?, ?);",
                        [resp, verdadero, id],
                        (err, result) => {
                          connection.release();
                          if (err){
                            callback(err);
                          }
                          else {
                            callback(null);
                          }
                        }
                        );
                      })
                    }
                }
            );
        })
    }


  }

module.exports = {
    DAOPreguntas: DAOPreguntas
}
