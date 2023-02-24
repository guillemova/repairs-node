const { Sequelize } = require('sequelize');

const db = new Sequelize({
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST, //direccion donde se encuentra la base de datos
    username: process.env.DB_USERNAME, //usuario por defecto 
    password: process.env.DB_PASSWORD, //contraseña en postgre
    database: process.env.DB_NAMEDB, //nombre de la base de datos
    logging: false //  ver en consola las consultas relacionadas.
})


module.exports = { db };