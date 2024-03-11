import Express from "express";
import {
  formularioLogin,
  formularioRegistro,
  formularioOlvidePassword,
  registrarUsuario,
  confirmar,
  resetPassword,
  comprobarToken,
  nuevoPassword,
  autenticar,
  cerrarSesion,
} from "../controllers/usuarioController.js";

const Router = Express.Router();

Router.get("/login", formularioLogin);
Router.post("/login", autenticar);

//Cerrar sesion
Router.post("/logout", cerrarSesion);

Router.get("/registro", formularioRegistro);
Router.post("/registro", registrarUsuario);

Router.get("/olvide", formularioOlvidePassword);
Router.post("/olvide", resetPassword);

// Almacena el nuevo password
Router.get("/olvide/:token", comprobarToken);
Router.post("/olvide/:token", nuevoPassword);

Router.get("/confirmar/:token", confirmar);

export default Router;
