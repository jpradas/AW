CREATE DATABASE facebluff;
USE facebluff;

CREATE TABLE control_usuarios(
	id INT AUTO_INCREMENT,
	email VARCHAR(30) PRIMARY KEY NOT NULL, 
    contraseña VARCHAR(30) NOT NULL,
    nombre_completo VARCHAR(50),
    sexo CHAR,
    fecha_nacimiento DATE,
    imagen VARCHAR(50),
	puntos INT,
);
