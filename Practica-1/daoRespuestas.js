"use strict"

const config = require("./config");



class DAORespuestas{
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
    getRespuestas(id, callback) {
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query(
                "SELECT * FROM " + config.database +".respuestas WHERE idPregunta=?;",
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
    /*
    setImg(foto, callback){
      this.pool.getConnection((err, connection) =>{
          if(err){
              callback(err); return;
          }
          connection.query(
              "INSERT INTO "+ config.database +".fotos VALUES (?,?,?)",
              [foto.originalname, ],
              (err, result) =>{
                  connection.release();
                  if(err){
                    callback(err);return;
                  }
                  callback(null, true);
              }
          );
      });
    }
    */
  }

module.exports = {
    DAORespuestas: DAORespuestas
}
