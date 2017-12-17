-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-12-2017 a las 15:35:56
-- Versión del servidor: 10.1.13-MariaDB
-- Versión de PHP: 5.6.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `facebluff`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `adivinar`
--

CREATE TABLE `adivinar` (
  `id_pregunta` int(11) NOT NULL,
  `user_adivina` varchar(30) NOT NULL,
  `user_destino` varchar(30) NOT NULL,
  `acierta` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `amigos`
--

CREATE TABLE `amigos` (
  `email_origen` varchar(30) DEFAULT NULL,
  `email_destino` varchar(30) DEFAULT NULL,
  `confirmado` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fotos`
--

CREATE TABLE `fotos` (
  `filename` varchar(50) NOT NULL,
  `user` varchar(30) NOT NULL,
  `foto` longblob
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `opciones`
--

CREATE TABLE `opciones` (
  `id` int(11) NOT NULL,
  `opcion` varchar(100) NOT NULL,
  `idPregunta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preguntas`
--

CREATE TABLE `preguntas` (
  `id` int(11) NOT NULL,
  `texto` varchar(100) NOT NULL,
  `opcionesIniciales` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preguntasusers`
--

CREATE TABLE `preguntasusers` (
  `id_pregunta` int(11) NOT NULL,
  `user` varchar(30) NOT NULL,
  `id_opcion` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `email` varchar(30) NOT NULL,
  `contraseña` varchar(30) NOT NULL,
  `nombre_completo` varchar(50) DEFAULT NULL,
  `sexo` varchar(15) DEFAULT NULL,
  `edad` int(11) DEFAULT NULL,
  `imagen` longblob,
  `puntos` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `adivinar`
--
ALTER TABLE `adivinar`
  ADD KEY `id_pregunta` (`id_pregunta`),
  ADD KEY `user_adivina` (`user_adivina`),
  ADD KEY `user_destino` (`user_destino`);

--
-- Indices de la tabla `amigos`
--
ALTER TABLE `amigos`
  ADD KEY `email_origen` (`email_origen`),
  ADD KEY `email_destino` (`email_destino`);

--
-- Indices de la tabla `fotos`
--
ALTER TABLE `fotos`
  ADD PRIMARY KEY (`filename`,`user`),
  ADD KEY `user` (`user`);

--
-- Indices de la tabla `opciones`
--
ALTER TABLE `opciones`
  ADD PRIMARY KEY (`id`,`idPregunta`),
  ADD KEY `idPregunta` (`idPregunta`);

--
-- Indices de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `preguntasusers`
--
ALTER TABLE `preguntasusers`
  ADD KEY `id_pregunta` (`id_pregunta`),
  ADD KEY `user` (`user`),
  ADD KEY `id_opcion` (`id_opcion`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `opciones`
--
ALTER TABLE `opciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `adivinar`
--
ALTER TABLE `adivinar`
  ADD CONSTRAINT `adivinar_ibfk_1` FOREIGN KEY (`id_pregunta`) REFERENCES `preguntas` (`id`),
  ADD CONSTRAINT `adivinar_ibfk_2` FOREIGN KEY (`user_adivina`) REFERENCES `users` (`email`),
  ADD CONSTRAINT `adivinar_ibfk_3` FOREIGN KEY (`user_destino`) REFERENCES `users` (`email`);

--
-- Filtros para la tabla `amigos`
--
ALTER TABLE `amigos`
  ADD CONSTRAINT `amigos_ibfk_1` FOREIGN KEY (`email_origen`) REFERENCES `users` (`email`),
  ADD CONSTRAINT `amigos_ibfk_2` FOREIGN KEY (`email_destino`) REFERENCES `users` (`email`);

--
-- Filtros para la tabla `fotos`
--
ALTER TABLE `fotos`
  ADD CONSTRAINT `fotos_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`email`);

--
-- Filtros para la tabla `opciones`
--
ALTER TABLE `opciones`
  ADD CONSTRAINT `opciones_ibfk_1` FOREIGN KEY (`idPregunta`) REFERENCES `preguntas` (`id`);

--
-- Filtros para la tabla `preguntasusers`
--
ALTER TABLE `preguntasusers`
  ADD CONSTRAINT `preguntasusers_ibfk_1` FOREIGN KEY (`id_pregunta`) REFERENCES `preguntas` (`id`),
  ADD CONSTRAINT `preguntasusers_ibfk_2` FOREIGN KEY (`user`) REFERENCES `users` (`email`),
  ADD CONSTRAINT `preguntasusers_ibfk_3` FOREIGN KEY (`id_opcion`) REFERENCES `opciones` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
