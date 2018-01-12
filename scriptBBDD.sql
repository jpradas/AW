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
	filename VARCHAR(50) NOT NULL,
	user VARCHAR(30),
	foto LONGBLOB,
	FOREIGN KEY (user) references users(email),
	PRIMARY KEY (filename, user)
);

CREATE TABLE preguntas(
	id int PRIMARY KEY AUTO_INCREMENT,
	texto VARCHAR(100) NOT NULL,
	opcionesIniciales int NOT NULL
);

CREATE TABLE opciones(
	id INT NOT NULL AUTO_INCREMENT,
	opcion VARCHAR(100) NOT NULL,
	idPregunta INT NOT NULL,
	FOREIGN KEY (idPregunta) references preguntas(id),
	PRIMARY KEY (id, idPregunta)
);

CREATE TABLE PreguntasUsers(
	id_pregunta int NOT NULL,
	user VARCHAR(30) NOT NULL,
	id_opcion int, /* Opcion que marcas como respuesta */
	FOREIGN KEY (id_pregunta) references preguntas(id),
	FOREIGN KEY (user) references users(email),
	FOREIGN KEY (id_opcion) references opciones(id)
);

CREATE TABLE adivinar(
		id_pregunta int not null,
    user_adivina varchar(30) not null,
		user_destino varchar(30) not null,
    acierta tinyint(1) not null,
    foreign key (id_pregunta) references preguntas(id),
    foreign key (user_adivina) references users(email),
		foreign key (user_destino) references users(email)
);