CREATE DATABASE facebluff;
USE facebluff;

CREATE TABLE control_usuarios(
	email VARCHAR(30) PRIMARY KEY NOT NULL, 
    contraseña VARCHAR(30) NOT NULL,
    nombre_completo VARCHAR(50),
    sexo CHAR,
    fecha_nacimiento DATE,
    imagen VARCHAR(20),
	puntos INT,
    FOREIGN KEY (imagen) REFERENCES imagenes(id)
);

CREATE TABLE imagenes(
	id VARCHAR(20) PRIMARY KEY,
    imagen LONGBLOB,
    tipo VARCHAR(100)
);