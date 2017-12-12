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

    sumarPuntos(user, puntos, callback){
      this.pool.getConnection((err, connection) =>{
          if(err){
              callback(err); return;
          }
          connection.query(
              "UPDATE " + config.database +".users SET puntos=? WHERE email=?",
              [puntos, user],
              (err, rows)=>{
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

    setUser(user, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            let edad = calcularEdad(user.fecha_de_nacimiento);
              connection.query(
                  "INSERT INTO "+ config.database +".users VALUES (?,?,?,?,?,?,0)",
                  [user.email, user.password, user.nombre_completo, user.sexo, edad, user.imagen_perfil.buffer],
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

    findUsersPattern(pattern, user, callback){
      this.pool.getConnection((err, connection)=>{
        if(err){
          callback(err); return;
        }
       pattern = "%" + pattern + "%";
        connection.query(
            "SELECT * FROM " + config.database + ".users as u WHERE u.nombre_completo like ? AND u.email not in (select email_destino from "+ config.database +".amigos WHERE email_origen=?)",
            [pattern, user],
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

    modifyUser(query, array, callback){
      this.pool.getConnection((err, connection) =>{
        if(err){
          callback(err);return;
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

function calcularEdad(fecha) {
    var hoy = new Date();
    var cumpleanos = new Date(fecha);
    var edad = hoy.getFullYear() - cumpleanos.getFullYear();
    var m = hoy.getMonth() - cumpleanos.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }
    return edad;
}

module.exports = {
    DAOusers: DAOusers
}
