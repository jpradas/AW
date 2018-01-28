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
    * Extrae las opciones de una pregunta
    * @param {Integer} idPregunta id de la pregunta de la cual extraer las opciones
    * @param {Function} callback Funcion callback referida cuando termina la ejecución de la query
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

    /**
    * Inserta las opciones de una pregunta
    * @param {String} query query que realizar en base de datos
    * @param {Array} datos datos a insertar en la query parametrizada
    * @param {Function} callback Funcion callback referida cuando termina la ejecución de la query
    */
    setOpciones(opcion, id, callback){
      this.pool.getConnection((err, connection)=>{
        if(err){
          callback(err);return;
        }
        let sql = "INSERT INTO " + config.database + ".opciones VALUES"
        let datos = [];
        for (let i = 0; i < opcion.length - 1 ; i++){
            sql = sql.concat(" (NULL, ?, ?),");
            datos.push(opcion[i]);
            datos.push(id);
        }
        sql = sql.concat(" (NULL, ?, ?);");
        datos.push(opcion[opcion.length - 1]);
        datos.push(id);
        connection.query(
          sql,
          datos,
          (err, result)=>{
            connection.release();
            if(err){
              callback(err);return;
            }
            callback(null, true);
          }
        )
      })
    }

    /**
    * Extrae opciones para tratar de adivinar la pregunta
    * @param {Integer} idPregunta id de la pregunta de la cual extraer las opciones
    * @param {Integer} limite numero de opciones a visualizar
    * @param {Integer} idOpcion id de la opcion correcta
    * @param {Function} callback Funcion callback referida cuando termina la ejecución de la query
    */
    getOpcionesAdivinar(idPregunta, limite, idOpcion, callback) {
      let num = limite - 1;
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query(
                "SELECT * FROM " + config.database +".opciones WHERE id=?;",
                [idOpcion],
                (err, opcion)=>{
                    if(err){
                        connection.release();
                        callback(err); return;
                    }
                    else if(num > 0){
                      connection.query(
                          "SELECT * FROM " + config.database +".opciones WHERE idPregunta=? AND NOT id=? ORDER BY RAND() LIMIT ?;",
                          [idPregunta, idOpcion, num],
                          (err, result)=>{
                              connection.release();
                              if(err){
                                  callback(err); return;
                              }
                              else{
                                for (let i =0; i < result.length; i++){
                                  opcion.push(result[i]);
                                }
                                  callback(null, opcion);
                              }
                          }
                      );
                    }
                    else {
                      callback(null, opcion);
                    }
                }
            );

        })
    }

    /**
    * Inserta una nueva opcion creada por el usuario
    * @param {String} textoOpcion string con la nueva opcion
    * @param {Integer} idPregunta id de la pregunta a la cual se añade la nueva opcion
    * @param {Function} callback Funcion callback referida cuando termina la ejecución de la query
    */
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

    /**
    * Inserta la respuesta dada por el usuario a una pregunta
    * @param {Integer} idPregunta id de la pregunta que se ha contestado
    * @param {String} user email de usuario que ha contestado
    * @param {Integer} idOpcion id de la opcion elegida
    * @param {Function} callback Funcion callback referida cuando termina la ejecución de la query
    */
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
