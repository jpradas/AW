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

    //Saca la lista de amigos del usuario que han contestado a la pregunta y si han acertado la pregunta
    getAmigosContestanPregunta(user,idPregunta, callback){
      this.pool.getConnection((err, connection)=>{
        if(err){
          callback(err); return;
        }
        connection.query(
          //"SELECT * FROM " + config.database + ".amigos as a JOIN " + config.database + ".users as u ON a.email_origen=u.email JOIN " + config.database + ".preguntasusers as p ON a.email_destino=p.user LEFT JOIN " + config.database + ".adivinar as ad ON ad.user_respondio=a.email_destino AND ad.user_adivina=u.email WHERE a.email_origen=? AND p.id_pregunta=?;",
          "SELECT * FROM amigos as a JOIN users as u ON a.email_destino=u.email JOIN preguntasusers as p ON a.email_destino=p.user LEFT JOIN adivinar as ad ON ad.id_pregunta=p.id_pregunta AND ad.user_adivina=a.email_origen WHERE a.email_origen=? AND p.id_pregunta=?;",
          [user, idPregunta],
          (err, rows)=>{

            if(err){
              connection.release();
              callback(err); return;
            }
            else{
              connection.release();
              callback(null, rows);
            }
          }
        )
      })
    }

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
