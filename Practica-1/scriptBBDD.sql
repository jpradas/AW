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
