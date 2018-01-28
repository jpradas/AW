"use strict"

const config = require("./config");



class DAOusers{
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
                "SELECT * FROM " + config.database +".users WHERE email=? AND contraseña=?",
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
     * Actualiza los puntos de un usuario
     * @param {String} user usuario al que se le cambiaran los puntos
     * @param {Integer} puntos nuevos puntos que tiene
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    actualizarPuntos(user, puntos, callback){
      this.pool.getConnection((err, connection) =>{
          if(err){
              callback(err); return;
          }
          connection.query(
              "UPDATE " + config.database +".users SET puntos=? WHERE email=?",
              [puntos, user],
              (err)=>{
                  connection.release();
                  if(err){
                      callback(err);
                  }
                  else{
                    callback(null);
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
                "SELECT * FROM " + config.database + ".users WHERE email=?",
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
    setUser(user, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
              connection.query(
                  "INSERT INTO "+ config.database +".users VALUES (?,?,?,?,?,?,0)",
                  [user.email, user.password, user.nombre_completo, user.sexo, user.edad, user.imagen_perfil],
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

    /**
     * Busca usuarios que coinciden con el patron pasado y que no son amigos del usuario
     * @param {String} pattern patron por el que buscamos en BBDD
     * @param {String} user usuario del que se buscará aquellos que no son sus amigos para mostrar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    findUsersPattern(pattern, user, callback){
      this.pool.getConnection((err, connection)=>{
        if(err){
          callback(err); return;
        }
       pattern = "%" + pattern + "%";
        connection.query(
            "SELECT * FROM " + config.database + ".users as u WHERE u.nombre_completo like ? AND u.email not in (select email_destino from "+ config.database +".amigos WHERE email_origen=?) AND u.email not in (select email from " + config.database + ".users where email=?);",
            [pattern, user, user],
          (err, rows)=>{
            connection.release();
            if(err){
              callback(err);return;
            }
            callback(null, rows);
          }
        )
      })
    }

    /**
     * Modifica los datos de un usuario
     * @param {String} query query que debe realizar el dao
     * @param {Array} array array con los datos para la consulta parametrica
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    modifyUser(file, nombre, edad, sexo, email, callback){
      this.pool.getConnection((err, connection) =>{
        if(err){
          callback(err);return;
        }
        let query; let array;
        if(file){
           query = "UPDATE " + config.database + ".users SET nombre_completo=?, edad=?, sexo=?, imagen=? WHERE email=?;";
           array = [nombre, edad, sexo, file.buffer, email];
        }else{
           query = "UPDATE " + config.database + ".users SET nombre_completo=?, edad=?, sexo=? WHERE email=?;";
           array = [nombre, edad, sexo, email];
        }
        connection.query(
          query,
          array,
          (err)=>{
            connection.release();
            if(err){
              callback(err);return;
            }
            callback(null, true);
          }
        );
      })
    }

    /**
     * Obtiene la imagen de perfil de un usuario
     * @param {String} email usuario al que se le busca la foto de perfil
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    obtenerImg(email, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            connection.query(
                "SELECT * FROM " + config.database + ".users WHERE email=?",
                [email],
                (err, rows)=>{
                    connection.release();
                    if(err){
                        callback(err);return;
                    }
                    callback(null, rows[0].imagen);
                }
            );
        })
    }

}

module.exports = {
    DAOusers: DAOusers
}
