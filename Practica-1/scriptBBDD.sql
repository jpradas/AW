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
	texto VARCHAR(100) NOT NULL,
	user VARCHAR(30) NOT NULL,
	FOREIGN KEY (user) references users(email)
);

CREATE TABLE respuestas(
	respuesta VARCHAR(30),
	verdadero bit NOT NULL,
	idPregunta int NOT NULL,
	FOREIGN KEY (idPregunta) references preguntas(id),
	PRIMARY KEY (respuesta, idPregunta)
);

INSERT INTO `users` (`email`, `contraseña`, `nombre_completo`, `sexo`, `edad`, `imagen`, `puntos`) VALUES ('tu', 'tu','tu', 'otro', 80, NULL, 0);

INSERT INTO facebluff.preguntas (`id`, `texto`, `user`) VALUES (1,'¿Quien es el mejor desarrollador de js?', 'tu');
INSERT INTO facebluff.preguntas (`id`, `texto`, `user`) VALUES (2,'¿Quien es el mejor jugador de cr?', 'tu');
INSERT INTO facebluff.preguntas (`id`, `texto`, `user`) VALUES (3,'¿Quien es el mejor desarrollador de bbdd?', 'tu');
INSERT INTO facebluff.preguntas (`id`, `texto`, `user`) VALUES (4,'¿Quien es el peor profesor?', 'tu');

INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('carlos', 0, 1);
INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('juan', 0, 1);
INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('jesus', 1, 1);
INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('josue', 0, 1);

INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('carlos', 0, 2);
INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('juan', 0, 2);
INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('jesus', 1, 2);
INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('josue', 0, 2);

INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('carlos', 0, 3);
INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('juan', 0, 3);
INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('jesus', 0, 3);
INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('josue', 1, 3);

INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('hank', 0, 4);
INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('auron', 0, 4);
INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('hector', 1, 4);
INSERT INTO facebluff.respuestas (`respuesta`, `verdadero`, `idPregunta`) VALUES ('antonio', 0, 4);
