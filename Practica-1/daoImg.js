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

    /**
    * Extrae el nombre de la imagen o imagenes de un usuario segun su email
    * @param {String} email Email del usuario del que extraer los nombres de las imagenes
    * @param {Function} callback Funcion callback referida cuando termina la ejecución de la query
    */
    getImgbyUser(email, callback){
      this.pool.getConnection((err, connection) =>{
        if(err){
          callback(err);return;
        }
        connection.query(
          "SELECT filename FROM " + config.database + ".fotos WHERE user=?",
          [email],
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
    * Extrae la imagen (buffer) segun el nombre del archivo
    * @param {String} filename nombre del archivo que extraer
    * @param {Function} callback Funcion callback referida cuando termina la ejecución de la query
    */
    getImgbyFilename(filename, callback){
      this.pool.getConnection((err, connection) =>{
        if(err){
          callback(err);return;
        }
        connection.query(
          "SELECT foto FROM " + config.database + ".fotos WHERE filename=?;",
          [filename],
          (err, result)=>{
            connection.release();
            if(err){
              callback(err);return;
            }
            callback(null, result[0].foto);
          }
        )
      })
    }

    /**
    * Inserta en BBDD la imagen que haya elegido el usuario
    * @param {Object} foto objeto tipo request.file en el que se encuentra la informacion necesaria.
    * @param {String} email email que quiere realizar la inserccion
    * @param {Function} callback Funcion callback referida cuando termina la ejecución de la query
    */
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
