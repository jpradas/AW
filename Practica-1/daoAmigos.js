"use strict"

const config = require("./config");


class DAOamigos{
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
    * Extrae todos los amigos de un usuario
    * @param {String} user Email del usuario del que extraemos sus amigos
    * @param {Function} callback Funcion callback referida cuando termina la ejecución de la query
    */
    getAmigos(user, callback){
      this.pool.getConnection((err, connection)=>{
        if(err){
          callback(err); return;
        }
        connection.query(
          "SELECT * FROM " + config.database + ".amigos as a JOIN " + config.database + ".users as u WHERE a.email_origen=? AND a.email_destino=u.email",
          [user],
          (err, rows)=>{
            connection.release();
            if(err){
              callback(err); return;
            }
            else{
              callback(null, rows);
            }
          }
        )
      })
    }

    /**
    * Saca la lista de amigos del usuario que han contestado a la pregunta y si han acertado la pregunta
    * @param {String} user Email del usuario del que extraemos sus amigos
    * @param {Integer} idPregunta id de la pregunta a la cual nos referimos
    * @param {Function} callback Funcion callback referida cuando termina la ejecución de la query
    */
    getAmigosContestanPregunta(user,idPregunta, callback){
      this.pool.getConnection((err, connection)=>{
        if(err){
          callback(err); return;
        }
        connection.query(
          "SELECT * FROM "+ config.database +".amigos as a JOIN "+ config.database +".users as u ON a.email_destino=u.email JOIN "+ config.database +".preguntasusers as p ON a.email_destino=p.user LEFT JOIN "+ config.database +".adivinar as ad ON ad.id_pregunta=p.id_pregunta AND ad.user_adivina=a.email_origen AND a.email_destino=ad.user_destino WHERE a.email_origen=? AND p.id_pregunta=?",
          [user, idPregunta],
          (err, rows)=>{
            connection.release();
            if(err){
              callback(err); return;
            }
            else{
              callback(null, rows);
            }
          }
        )
      })
    }

    /**
    * Inserta en BBDD la solicitud a un amigo
    * @param {String} userOrigen Email del usuario que envia la peticion
    * @param {String} userDestino Email del usuario que recibe la peticion
    * @param {Function} callback Funcion callback referida cuando termina la ejecución de la query
    */
    enviarSolicitud(userOrigen, userDestino, callback){
      this.pool.getConnection((err, connection) =>{
        if(err){
          callback(err);return;
        }
        connection.query(
          "INSERT INTO " + config.database + ".amigos VALUES(?,?,?),(?,?,?)",
          [userOrigen, userDestino, 2, userDestino, userOrigen, 0],
          (err)=>{
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
    * Acepta una solicitud de amistad
    * @param {String} userOrigen Email del usuario que envia la peticion
    * @param {String} userDestino Email del usuario que recibe la peticion
    * @param {Function} callback Funcion callback referida cuando termina la ejecución de la query
    */
    aceptarSolicitud(userOrigen, userDestino, callback){
      this.pool.getConnection((err, connection)=>{
        if(err){
          callback(err);return;
        }
        connection.query(
          "UPDATE " + config.database + ".amigos SET confirmado=? WHERE email_origen=? AND email_destino=?;",
          [1, userOrigen, userDestino],
          (err)=>{
            if(err){
              connection.release();
              callback(err);return;
            }
            connection.query(
              "UPDATE " + config.database + ".amigos SET confirmado=? WHERE email_origen=? AND email_destino=?;",
              [1, userDestino, userOrigen],
              (err)=>{
                connection.release();
                if(err){
                  callback(err);return;
                }
                callback(null, true);
              }
            )
          }
        )
      })
    }

    /**
    * Rechaza una solicitud de amistad
    * @param {String} userOrigen Email del usuario que envia la peticion
    * @param {String} userDestino Email del usuario que recibe la peticion
    * @param {Function} callback Funcion callback referida cuando termina la ejecución de la query
    */
    rechazarSolicitud(userOrigen, userDestino, callback){
      this.pool.getConnection((err, connection)=>{
        if(err){
          callback(err);return;
        }
        connection.query(
          "DELETE FROM "+ config.database +".amigos WHERE email_origen=? AND email_destino=?;",
          [userOrigen, userDestino],
          (err)=>{
            if(err){
              connection.release();
              callback(err);return;
            }
            connection.query(
              "DELETE FROM "+ config.database +".amigos WHERE email_origen=? AND email_destino=?;",
              [userDestino, userOrigen],
              (err)=>{
                connection.release();
                if(err){
                  callback(err);return;
                }
                callback(null, true);
              }
            )
          }
        )
      })
    }

}


module.exports = {
    DAOamigos: DAOamigos
}
