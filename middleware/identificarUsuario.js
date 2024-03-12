import jwt from "jsonwebtoken";
import { Usuario } from "../models/index.js";

const identificarUsuario = async (req, res, next) => {
  // Identificar si el token esta en las cookies
  const { _token } = req.cookies;
  console.log(_token, "TOKEN");

  if (!_token) {
    console.log("NO HAY TOKEN");
    req.usuario = null;

    return next();
  }

  try {
    const decoded = jwt.verify(_token, process.env.JWT_SECRET);
    const usuario = await Usuario.scope("eliminarPassword").findByPk(
      decoded.id
    );

    if (usuario) {
      req.usuario = usuario;
    }

    return next();
  } catch (e) {
    console.log(e);

    return res.clearCookie("_token").redirect("/auth/login");
  }
};

export default identificarUsuario;
