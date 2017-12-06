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
            callback(null, rows);
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

    yaExisteSolicitud(userOrigen, userDestino, callback){
      this.pool.getConnection((err, connection) =>{
        if(err){
          callback(err);return;
        }
        connection.query(
          "SELECT * FROM facebluff.solicitudes WHERE email=? AND solicitado=?",
          [userOrigen, userDestino],
          (err, rows)=>{
            connection.release();
            if(err){
              callback(err);return;
            }
            if(rows.length === 0){
              callback(null, false);
            }else{
              callback(null, true);
            }
          }
        )
      })
    }
}


module.exports = {
    DAOamigos: DAOamigos
}
