// ? Generamos la instancia para requerir express.
const express = require("express")
// ? Generamos la instancia para requerir las cors.
const cors = require("cors")
const morgan = require("morgan")
const helmet = require("helmet")
const hpp = require("hpp")
const rateLimit = require("express-rate-limit")
const xss = require('xss-clean')

const globalErrorHandler = require("../controllers/error/error.controller")
const AppError = require("../utils/appError")
// ? Generamos las instancias correspondientes para requerir
// ? nuestros archivos de rutas desde su origen en el documento.
const { userRouter } = require("../routes/user.routes")
const { repairsRouter } = require("../routes/repairs.routes")
const { db } = require("../database/db")
const { authRouter } = require("../routes/auth/auth.routes")
const initModel = require("./init.model")

// ? Declaramos una clase llamada servidor,
// ? la cual va a obtener toda la configuracion necesaria para levantar nuestro servidor..
class Server {
    // ? 1er.  Paso : Se genera el constructor que sera el responsable de levantar el servidor.
    constructor() {
        // ? igualamos nuestra app con express
        this.app = express()
        // ? declaramos el puerto donde se ejecutara nuestro servidor.
        this.port = process.env.PORT || 4000

        // ? Limite de Peticiones
        this.limiter = rateLimit({
            max: 100,
            windowMs: 60 * 60 * 1000,
            message: 'Too many request from this IP, Place try again in an hour!.'
        })

        // ? Generamos los paths o rutas donde iremos almacenando la informacion de las peticiones.
        this.paths = {
            users: '/api/v1/users',
            repairs: '/api/v1/repairs',
            auth: '/api/v1/auth'
        }

        // ? llamada para el metodo de coneccion con la base de datos
        this.database()

        // ? llamamos nuestros middlewares para que se ejecuten antes que las rutas.
        this.middlewares()

        // ? se ejecutan las rutas.
        this.routes()
    }

    // ? colocamos los middlewares los cuales son configuraciones para muestro servidor
    middlewares() {
        this.app.use(helmet())

        this.app.use(xss())

        this.app.use(hpp())

        if (process.env.NODE_ENV === 'development') {
            this.app.use(morgan('dev'))
        }

        this.app.use('/api/v1', this.limiter)

        this.app.use(cors())
        this.app.use(express.json())
    }

    // ? Declaramos las clases y funciones de donde obtendremos las rutas.
    routes() {
        this.app.use(this.paths.users, userRouter)
        this.app.use(this.paths.repairs, repairsRouter)
        this.app.use(this.paths.auth, authRouter)

        this.app.all('*', (req, res, next) => {
            return next(new AppError(`can't find ${req.originalUrl} on this server`, 404))
        })

        this.app.use(globalErrorHandler)
    }

    // configuracion para la base de datos
    database() {
        db.authenticate()
            .then(() => console.log('Database authenticated'))
            .catch(error => console.log(error));

        initModel()

        db.sync()
            .then(() => console.log('Database synced'))
            .catch(error => console.log("aqui el error de sync => 🧨", error));
    }

    // ? Se genera el llamado a nuestro servidor.!
    listen() {
        this.app.listen(this.port, () => {
            console.log('server is running on port', this.port);
        })
    }
}

// ? Realizamos la exportacion de nuestro server para que sea consumido en nuestra app.
module.exports = Server