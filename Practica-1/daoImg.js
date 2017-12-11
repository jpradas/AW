"use strict"

const config = require("./config");



class DAOimg{
/**
     * Inicializa el DAO de usuarios.
     *
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    getImgbyUser(email, callback){
      this.pool.getConnection((err, connection) =>{
        if(err){
          callback(err);return;
        }
        connection.query(
          "SELECT filename FROM " + config.database + ".fotos WHERE user=?",
          [email],
          (err, rows)=>{
            
          }
        )
      })
    }

    setImg(foto, email, callback){
      this.pool.getConnection((err, connection) =>{
          if(err){
              callback(err); return;
          }
          connection.query(
              "INSERT INTO "+ config.database +".fotos VALUES (?,?,?)",
              [foto.originalname, email, foto.buffer],
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
  }

module.exports = {
    DAOimg: DAOimg
}
