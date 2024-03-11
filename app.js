import Express from "express";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import propioedadesRoutes from "./routes/propiedadesRoutes.js";
import appRoutes from "./routes/appRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";
import db from "./config/db.js";

// Crear la app
const app = Express();

app.use(Express.urlencoded({ extended: true })); //middleware para leer datos del formulario
app.use(Express.json()); //middleware para leer datos del formulario en formato json

//Habilitar cookie parser
app.use(cookieParser());

//Habilitar CSRF
app.use(csurf({ cookie: true }));

// Conectar a la base de datos
try {
  await db.authenticate();
  db.sync(); //sincroniza la base de datos con los modelos
  console.log("Database connected");
} catch (error) {
  console.log(error.response.data);
}

//Habilitar PUG
app.set("view engine", "pug");
app.set("views", "./views");

// Routing
app.use("/", appRoutes); //cuando visito la ruta /, ejecuto el Router
app.use("/auth", usuarioRoutes); //cuando visito la ruta /auth, ejecuto el Router
app.use("/", propioedadesRoutes); //cuando visito la ruta /, ejecuto el Router
app.use("/api", apiRoutes); //cuando visito la ruta /api, ejecuto el Router

// Definir carpeta publica
app.use(Express.static("public"));

// Definir Puerto
const PORT = process.env.PORT || 4000;

// Arrancar proyecto
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
