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