"use strict"

const config = require("./config");

class DAOpartidas{
  /**
   * Inicializa el DAO de partidas.
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
     getPartidas(idUser, callback){
       this.pool.getConnection((err, connection) =>{
           if(err){
               callback(err); return;
           }
           connection.query(
               "SELECT * FROM "+ config.database +".partidas AS p JOIN " + config.database + ".juega_en AS je ON p.id=je.idPartida WHERE je.idUsuario=?",
               [idUser],
               (err, rows) =>{
                   connection.release();
                   if(err){
                     callback(err);return;
                   }
                   callback(null, rows);
               }
           );
       });
     }

}

module.exports = {
    DAOpartidas: DAOpartidas
}
