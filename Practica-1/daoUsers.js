"use strict"



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
                "SELECT * FROM facebluff.users WHERE email=? AND contraseña=?",
                [email, password],
                (err, rows)=>{
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    connection.release();
                    if(rows.length === 0){
                        callback(null, undefined);
                    }else{
                        callback(null, rows);
                    }
                }
            ); 
        })
    }

    insertNewUser(user, callback){
        this.pool.getConnection((err, connection) =>{
            if(err){
                callback(err); return;
            }
            let edad = calcularEdad(user.fecha_de_nacimiento);
            connection.query(
                "INSERT INTO facebluff.users VALUES (?,?,?,?,?,?,0)",
                [user.email, user.password, user.nombre_completo, user.sexo, edad, "./icons/"+user.imagen_perfil], 
                (err, result) =>{ 
                    if(err){
                        connection.release();
                        callback(err);return;
                    }
                    connection.query(
                        "SELECT * FROM facebluff.users WHERE email=? AND contraseña=?",
                        [user.email, user.password],
                        (err, rows)=>{
                            connection.release();
                            if(err){
                                callback(err);return;
                            }else{
                                callback(null, rows);
                            }
                        }
                    ); 
                }
            );
        });
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