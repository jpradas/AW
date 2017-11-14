SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE tareas;
USE tareas;

CREATE TABLE user(
	email VARCHAR(100) PRIMARY KEY,
	password VARCHAR(100),
	img VARCHAR(100)
);

CREATE TABLE task(
	id INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
	user VARCHAR(100),
	text TEXT,
	done TINYINT(1),
	FOREIGN KEY (user) REFERENCES (user.email)
);

CREATE TABLE tag(
	taskid INT(11),
	tag VARCHAR(100) PRIMARY KEY,
	FOREIGN KEY (taskid) REFERENCES (task.id)
);

GRANT ALL PRIVILEGES ON tareas.user TO 'root'@'localhost';
GRANT ALL PRIVILEGES ON tareas.task TO 'root'@'localhost';
GRANT ALL PRIVILEGES ON tareas.tag TO 'root'@'localhost';
FLUSH PRIVILEGES;