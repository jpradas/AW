INSERT INTO `users` (`email`, `contraseña`, `nombre_completo`, `sexo`, `edad`, `imagen`, `puntos`) VALUES ('tu', 'tu','tu', 'otro', 80, NULL, 0);
INSERT INTO `users` (`email`, `contraseña`, `nombre_completo`, `sexo`, `edad`, `imagen`, `puntos`) VALUES ('yo', 'yo','yo', 'puto', 20, NULL, 0);
INSERT INTO `users` (`email`, `contraseña`, `nombre_completo`, `sexo`, `edad`, `imagen`, `puntos`) VALUES ('el', 'el','el', 'X', 50, NULL, 0);

INSERT INTO preguntas (`id`, `texto`) VALUES (1,'¿Quien es el mejor desarrollador de js?');
INSERT INTO preguntas (`id`, `texto`) VALUES (2,'¿Quien es el mejor jugador de cr?');
INSERT INTO preguntas (`id`, `texto`) VALUES (3,'¿Quien es el mejor desarrollador de bbdd?');
INSERT INTO preguntas (`id`, `texto`) VALUES (4,'¿Quien es el peor profesor?');

INSERT INTO opciones (`id`, `opcion`, `idPregunta`) VALUES (1, 'carlos', 1);
INSERT INTO opciones (`id`, `opcion`, `idPregunta`) VALUES (2,'juan', 1);
INSERT INTO opciones (`id`, `opcion`, `idPregunta`) VALUES (3, 'jesus', 1);
INSERT INTO opciones (`id`, `opcion`, `idPregunta`) VALUES (4,'josue', 1);

INSERT INTO preguntasusers (`id_pregunta`, `user`, `id_opcion`) VALUES (1, 'tu', 3);
INSERT INTO preguntasusers (`id_pregunta`, `user`, `id_opcion`) VALUES (1, 'el', 2);
INSERT INTO preguntasusers (`id_pregunta`, `user`, `id_opcion`) VALUES (1, 'yo', 3);
/*
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
*/
