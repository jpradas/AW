"use strict"



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
          "SELECT * FROM amigos WHERE email=?",
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
}


module.exports = {
    DAOamigos: DAOamigos
}
