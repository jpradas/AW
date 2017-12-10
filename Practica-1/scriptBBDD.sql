SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE facebluff;
USE facebluff;

CREATE TABLE users(
	email VARCHAR(30) PRIMARY KEY NOT NULL,
  contraseña VARCHAR(30) NOT NULL,
  nombre_completo VARCHAR(50),
  sexo VARCHAR(15),
  edad INT,
  imagen LONGBLOB, -- foto de perfil
	puntos INT
);

CREATE TABLE amigos(
	email_origen VARCHAR(30),
	email_destino VARCHAR(30),
	confirmado INT,
	FOREIGN KEY (email_origen) references users(email),
	FOREIGN KEY (email_destino) references users(email)
);

CREATE TABLE fotos(
	filename VARCHAR(50) PRIMARY KEY NOT NULL,
	user VARCHAR(30),
	foto LONGBLOB,
	FOREIGN KEY (user) references users(email)
);

CREATE TABLE preguntas(
	id int PRIMARY KEY AUTO_INCREMENT,
	texto VARCHAR(100) NOT NULL
);

CREATE TABLE opciones(
	id INT NOT NULL AUTO_INCREMENT,
	opcion VARCHAR(100),
	verdadero INT NOT NULL,
	idPregunta INT NOT NULL,
	FOREIGN KEY (idPregunta) references preguntas(id),
	PRIMARY KEY (id, idPregunta)
);

CREATE TABLE PreguntasUsers(
	id_pregunta int,
	user VARCHAR(30),
	id_opcion int,
	FOREIGN KEY (id_pregunta) references preguntas(id),
	FOREIGN KEY (user) references users(email),
	FOREIGN KEY (id_opcion) references opciones(id)
);
