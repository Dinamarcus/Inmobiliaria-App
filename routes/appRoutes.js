import Express from "express";
import {
  inicio,
  categoria,
  noEncontrado,
  buscador,
  editarPerfil,
  guardarCambios,
} from "../controllers/appController.js";
import protegerRuta from "../middleware/protegerRuta.js";
import identificarUsuario from "../middleware/identificarUsuario.js";
import { body } from "express-validator";

const Router = Express.Router();

// Pagina de inicio
Router.get("/", identificarUsuario, inicio);

// Categorias
Router.get("/categorias/:id", identificarUsuario, categoria);

// Pagina 404
Router.get("/404", identificarUsuario, noEncontrado);

// Buscador
Router.post("/buscador", identificarUsuario, buscador);

// Editar perfil
Router.get("/editar-perfil/:id", protegerRuta, editarPerfil);

Router.post(
  "/editar-perfil/:id",
  body("nombre").notEmpty().withMessage("El nombre no puede ir vacio"),
  body("email").isEmail().withMessage("Email no valido"),
  protegerRuta,
  guardarCambios
);

export default Router;
