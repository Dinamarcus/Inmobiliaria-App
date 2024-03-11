import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import Usuario from "../models/Usuario.js";
import { generarId, generarJWT } from "../helpers/generarToken.js";
import { emailRegistro, emailOlvide } from "../helpers/emails.js";

const formularioLogin = (req, res) => {
  res.render("auth/login", {
    autenticado: false,
    pagina: "Iniciar Sesión",
    csrfToken: req.csrfToken(),
    barra: false,
  });
};

const autenticar = async (req, res) => {
  await check("email").isEmail().withMessage("Email no válido").run(req);
  await check("password")
    .notEmpty()
    .withMessage("El password no puede ir vacío")
    .run(req);

  let errors = validationResult(req);

  // Verificar que no haya errores
  if (!errors.isEmpty()) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesión",
      errores: errors.array(),
      csrfToken: req.csrfToken(),
    });
  }

  const { email, password } = req.body;

  //Comprobar si el usuario existe
  const usuario = await Usuario.findOne({
    where: { email },
  });

  if (!usuario) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesión",
      errores: [{ msg: "El usuario no existe" }],
      csrfToken: req.csrfToken(),
    });
  }

  // Comprobar que el usuario esté confirmado
  if (!usuario.confirmado) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesión",
      errores: [{ msg: "La cuenta no ha sido confirmada" }],
      csrfToken: req.csrfToken(),
    });
  }

  // Verificar el password y autenticar el usuario
  if (!usuario.verificarPassword(password)) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesión",
      errores: [{ msg: "El password es incorrecto" }],
      csrfToken: req.csrfToken(),
    });
  }

  // Generar JWT
  const token = generarJWT({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
  });

  // Almacenar el token en una cookie
  return res
    .cookie("_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: true,
    })
    .redirect("/mis-propiedades");
};

const cerrarSesion = (req, res) => {
  return res.clearCookie("_token").status(200).redirect("/");
};

const formularioRegistro = (req, res) => {
  res.render("auth/registro", {
    pagina: "Crear Cuenta",
    csrfToken: req.csrfToken(),
  });
};

const formularioOlvidePassword = (req, res) => {
  res.render("auth/olvide", {
    pagina: "Recupera tu Acceso",
    csrfToken: req.csrfToken(),
  });
};

const resetPassword = async (req, res) => {
  // Mostrar mensajes de error de express-validator
  await check("email").isEmail().withMessage("Email no válido").run(req);

  let errors = validationResult(req);

  // Verificar que no haya errores
  if (!errors.isEmpty()) {
    return res.render("auth/olvide", {
      pagina: "Recupera tu Acceso",
      errores: errors.array(),
      csrfToken: req.csrfToken(),
    });
  }

  // Verificar si el usuario existe
  const { email } = req.body;

  const usuario = await Usuario.findOne({
    where: { email },
  });

  if (!usuario) {
    return res.render("auth/olvide", {
      pagina: "Recupera tu Acceso",
      mensaje: "No existe una cuenta con ese email",
      error: true,
    });
  }

  // Generar un token
  usuario.token = generarId();
  await usuario.save();

  // Enviar un correo con el token
  emailOlvide({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  // Mostrar mensaje de confirmación
  res.render("templates/mensaje", {
    pagina: "Correo enviado",
    mensaje: "Hemos enviado un correo para reestablecer tu contraseña",
  });
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  // Verificar que el token sea válido
  const usuario = await Usuario.findOne({
    where: { token },
  });

  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Reestablecer Password",
      mensaje: "Hubo un error al validar tu informacion, intenta de nuevo",
      error: true,
    });
  }

  // Formulario para generar el password
  res.render("auth/reset-password", {
    pagina: "Reestablecer Password",
    csrfToken: req.csrfToken(),
  });
};

const nuevoPassword = async (req, res) => {
  /// Validar el password
  await check("password")
    .isLength({ min: 6 })
    .withMessage("El password debe ser de al menos 6 caracteres")
    .run(req);

  let errors = validationResult(req);

  // Verificar que no haya errores
  if (!errors.isEmpty()) {
    return res.render("auth/olvide", {
      pagina: "Reestablece tu Password",
      errores: errors.array(),
      csrfToken: req.csrfToken(),
    });
  }

  const { token } = req.params;
  const { password } = req.body;

  // Identificar quien hace el cambio
  const usuario = await Usuario.findOne({
    where: { token },
  });

  // Hashear el nuevo password
  const salt = await bcrypt.genSalt(10); // rondas de hasheo
  usuario.password = await bcrypt.hash(password, salt);
  usuario.token = null;

  await usuario.save();

  res.render("auth/confirmar", {
    pagina: "Password Actualizado",
    mensaje: "Tu password se ha actualizado correctamente",
  });
};

const registrarUsuario = async (req, res) => {
  // Mostrar mensajes de error de express-validator
  await check("nombre")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .run(req);

  await check("email").isEmail().withMessage("Email no válido").run(req);
  await check("password")
    .isLength({ min: 6 })
    .withMessage("El password debe ser de al menos 6 caracteres")
    .run(req);
  await check("password2")
    .equals(req.body.password)
    .withMessage("Los passwords no coinciden")
    .run(req);

  let errors = validationResult(req);

  // Verificar que no haya errores
  if (!errors.isEmpty()) {
    return res.render("auth/registro", {
      pagina: "Crear Cuenta",
      errores: errors.array(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
      csrfToken: req.csrfToken(),
    });
  }

  const { nombre, email, password } = req.body;

  // Verificar que el email no exista
  const existeUsuario = await Usuario.findOne({
    where: { email },
  });

  if (existeUsuario) {
    return res.render("auth/registro", {
      pagina: "Crear Cuenta",
      errores: [{ msg: "El email ya está registrado" }],
      usuario: {
        nombre,
        email,
      },
    });
  }

  // Crear el usuario
  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId(),
  });

  // Enviar un correo de confirmación
  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  // Mensaje de confirmación
  res.render("templates/mensaje", {
    pagina: "Cuenta creada correctamente",
    mensaje:
      "Hemos enviado un correo para confirmar tu cuenta. Revisalo y sigue las instrucciones.",
  });
};

const confirmar = async (req, res, next) => {
  const { token } = req.params;

  // Verificar si el token es valido
  const usuario = await Usuario.findOne({
    where: { token },
  });

  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Error al confirmar cuenta",
      mensaje: "Hubo un error al confirmar tu cuenta",
      error: true,
    });
  }

  // Confirmar la cuenta
  usuario.token = null;
  usuario.confirmado = 1;

  await usuario.save();

  return res.render("auth/confirmar-cuenta", {
    pagina: "Cuenta Confirmada",
    mensaje: "La cuenta ha sido confirmada correctamente",
  });
};

export {
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
};
