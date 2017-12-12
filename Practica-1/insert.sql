INSERT INTO `users` (`email`, `contraseña`, `nombre_completo`, `sexo`, `edad`, `imagen`, `puntos`) VALUES ('tu', 'tu','tu', 'otro', 80, NULL, 0);
INSERT INTO `users` (`email`, `contraseña`, `nombre_completo`, `sexo`, `edad`, `imagen`, `puntos`) VALUES ('yo', 'yo','yo', 'puto', 20, NULL, 0);
INSERT INTO `users` (`email`, `contraseña`, `nombre_completo`, `sexo`, `edad`, `imagen`, `puntos`) VALUES ('el', 'el','el', 'X', 50, NULL, 0);

INSERT INTO preguntas (`id`, `texto`, `opcionesIniciales`) VALUES (1,'¿Quien es el mejor desarrollador de js?', 4);
INSERT INTO preguntas (`id`, `texto`, `opcionesIniciales`) VALUES (2,'¿Quien es el mejor jugador de cr?', 2);
INSERT INTO preguntas (`id`, `texto`, `opcionesIniciales`) VALUES (3,'¿Quien es el mejor desarrollador de bbdd?', 0);
INSERT INTO preguntas (`id`, `texto`, `opcionesIniciales`) VALUES (4,'¿Quien es el peor profesor?', 0);

INSERT INTO opciones (`id`, `opcion`, `idPregunta`) VALUES (1, 'carlos', 1);
INSERT INTO opciones (`id`, `opcion`, `idPregunta`) VALUES (2,'juan', 1);
INSERT INTO opciones (`id`, `opcion`, `idPregunta`) VALUES (3, 'jesus', 1);
INSERT INTO opciones (`id`, `opcion`, `idPregunta`) VALUES (4,'josue', 1);

INSERT INTO opciones (`id`, `opcion`, `idPregunta`) VALUES (5, 'jesus', 2);
INSERT INTO opciones (`id`, `opcion`, `idPregunta`) VALUES (6,'josue', 2);

INSERT INTO preguntasusers (`id_pregunta`, `user`, `id_opcion`) VALUES (1, 'tu', 3);
INSERT INTO preguntasusers (`id_pregunta`, `user`, `id_opcion`) VALUES (1, 'el', 2);
INSERT INTO preguntasusers (`id_pregunta`, `user`, `id_opcion`) VALUES (1, 'yo', 3);
