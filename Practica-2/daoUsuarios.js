"use strict"

const config = require("./config");

class DAOusuarios{
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
     * @param {string} email Identificador del usuario a buscar
     * @param {string} password Contraseña a comprobar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    isUserCorrect(email, password, callback) {
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query(
                "SELECT * FROM " + config.database +".usuarios WHERE login=? AND password=?",
                [email, password],
                (err, rows)=>{
                    connection.release();
                    if(err){
                        callback(err);
                    }
                    if(rows.length === 0){
                        callback(null, false);
                    }else{
                        callback(null, true);
                    }
                }
            );
        })
    }

    /**
     * Devuelve un usuario de bbdd
     * @param {String} user usuario que queremos buscar en BBDD
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    getUser(user, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query(
                "SELECT * FROM " + config.database + ".usuarios WHERE login=?",
                [user],
                (err, rows)=>{
                    connection.release();
                    if(err){
                        callback(err);return;
                    }
                    callback(null, rows[0]);
                }
            );
        })
    }

    /**
     * Añade un nuevo usuario en BBDD
     * @param {Object} user objeto usuario que contiene todos los campos necesarios para insertar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    setUser(email, password, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
              connection.query(
                  "INSERT INTO "+ config.database +".usuarios VALUES (NULL,?,?)",
                  [email, password],
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

    getId(email, callback){
      this.pool.getConnection((err, connection) =>{
          if(err){
              callback(err); return;
          }
            connection.query(
                "SELECT id FROM "+ config.database +".usuarios WHERE login=?",
                [email],
                (err, result) =>{
                    connection.release();
                    if(err){
                      callback(err);return;
                    }
                    callback(null, result[0]);
                }
            );
      });
    }

}

module.exports = {
    DAOusuarios: DAOusuarios
}
