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

//Quiero poner la validacion de que si el campo passwordOld no esta vacio, entonces el campo password debe estar lleno y ademas deben ser iguales y tener longitud minima de 6 caracteres.

Router.post(
  "/editar-perfil/:id",
  body("nombre").notEmpty().withMessage("El nombre no puede ir vacio"),
  body("email").isEmail().withMessage("Email no valido"),
  protegerRuta,
  guardarCambios
);

export default Router;
