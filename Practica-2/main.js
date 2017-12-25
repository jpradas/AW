"use strict"

const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const mysql = require("mysql");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const flash = require("express-flash")
const config = require("./config");
const daoUsers = require("./daoUsers");
const daoAmigos = require("./daoAmigos");
const daoImagenes = require("./daoImg");
const daoPreguntas = require("./daoPreguntas")
const daoOpciones = require("./daoOpciones")
const underscore = require("underscore");
const expressValidator = require("express-validator");
