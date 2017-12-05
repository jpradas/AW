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
  sexo CHAR,
  edad INT,
  imagen VARCHAR(50),
	puntos INT
);

CREATE TABLE amigos(
	email VARCHAR(30),
	amigo VARCHAR(30),
	img VARCHAR(50),
	nombre VARCHAR(50),
	FOREIGN KEY (email) references users(email),
	FOREIGN KEY (amigo) references users(email)
);

CREATE TABLE solicitudes(
	email VARCHAR(30),
	solicitado VARCHAR(30),
	FOREIGN KEY (email) references users(email),
	FOREIGN KEY (solicitado) references users(email)
);
