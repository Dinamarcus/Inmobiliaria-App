import { Sequelize } from "sequelize";
import { Buffer } from "node:buffer";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { Precio, Categoria, Propiedad, Usuario } from "../models/index.js";
import hashBase64 from "../helpers/hashBase64.js";

const inicio = async (req, res) => {
  let authenticated = true;

  if (!req.usuario) {
    authenticated = false;
  }

  const categorias = await Categoria.findAll({ raw: true });
  const precios = await Precio.findAll({ raw: true });

  const [casas, departamentos] = await Promise.all([
    Propiedad.findAll({
      limit: 3,
      order: [["createdAt", "DESC"]],
      where: {
        categoriaId: 1,
        publicado: 1,
      },
      include: [
        {
          model: Precio,
          as: "precio",
        },
      ],
    }),
    Propiedad.findAll({
      limit: 3,
      order: [["createdAt", "DESC"]],
      where: {
        categoriaId: 2,
        publicado: 1,
      },
      include: [
        {
          model: Precio,
          as: "precio",
        },
      ],
    }),
  ]);

  res.render("inicio", {
    pagina: "Inicio",
    categorias,
    precios,
    casas,
    userId: hashBase64(req?.usuario?.id.toString()),
    departamentos,
    authenticated,
    csrfToken: req.csrfToken(),
  });
};

const categoria = async (req, res) => {
  const { id } = req.params;

  // Comprobar que la categoria existe
  const categoria = await Categoria.findByPk(id);

  if (!categoria) {
    return res.redirect("/404");
  }

  // Obtener propiedades de la categoria
  const propiedades = await Propiedad.findAll({
    where: {
      categoriaId: id,
      publicado: 1,
    },
    include: [
      {
        model: Precio,
        as: "precio",
      },
    ],
  });

  res.render("categoria", {
    pagina: `Categoria ${categoria.nombre}`,
    propiedades,
    userId: hashBase64(req?.usuario?.id.toString()),
    id,
    csrfToken: req.csrfToken(),
  });
};

const noEncontrado = async (req, res) => {
  let authenticated = true;

  if (!req.usuario) {
    authenticated = false;
  }

  res.render("404", {
    authenticated,
    pagina: "Pagina no encontrada",
    userId: hashBase64(req?.usuario?.id.toString()),
    csrfToken: req.csrfToken(),
  });
};

const buscador = async (req, res) => {
  const { termino } = req.body;

  // Validar que termino no este vacio
  if (!termino === "") {
    return res.redirect("back"); // Regresa a la pagina anterior
  }

  // Consultar las propiedades
  const propiedades = await Propiedad.findAll({
    where: {
      publicado: 1,
      titulo: {
        [Sequelize.Op.like]: "%" + termino + "%", // Buscar por titulo
      },
    },
    include: [
      {
        model: Precio,
        as: "precio",
      },
    ],
  });

  res.render("busqueda", {
    pagina: `Resultados para ${termino}`,
    propiedades,
    userId: hashBase64(req?.usuario?.id.toString()),
    csrfToken: req.csrfToken(),
  });
};

const editarPerfil = async (req, res) => {
  const { id } = req.params;

  //decodificar el id
  const buffer = Buffer.from(id, "base64");
  const idUsuario = buffer.toString("utf-8");

  let users = await Usuario.findAll({
    attributes: ["id", "nombre", "email"],
    raw: true,
  });

  const user = users.filter((user) => {
    return bcrypt.compareSync(user.id.toString(), idUsuario);
  });

  if (user.length === 0) {
    return res.redirect("/404");
  }

  res.render("propiedades/editar-perfil", {
    pagina: "Editar perfil",
    csrfToken: req.csrfToken(),
    user: user[0],
    userId: id,
  });
};

const guardarCambios = async (req, res) => {
  let resultado = validationResult(req);

  const { passwordOld: oldPass, passwordNew: newPass } = req.body;
  const passHashed = await Usuario.findByPk(req.usuario.id, {
    attributes: ["password"],
    raw: true,
  });
  const areSame = await bcrypt.compare(oldPass, passHashed.password);

  if (oldPass !== "" && newPass === "") {
    if (!areSame) {
      resultado.errors.push({
        value: oldPass,
        msg: "La contraseña actual es incorrecta",
        param: "passwordOld",
        location: "body",
      });
    }

    resultado.errors.push({
      value: "",
      msg: "El campo de nueva contraseña no puede estar vacio",
      param: "passwordNew",
      location: "body",
    });
  }

  if (oldPass === "" && newPass !== "") {
    resultado.errors.push({
      value: "",
      msg: "El campo de contraseña actual no puede estar vacio",
      param: "passwordOld",
      location: "body",
    });
  }

  if (oldPass !== "" && newPass !== "") {
    if (oldPass.length < 6 || newPass.length < 6) {
      resultado.errors.push({
        value: oldPass,
        msg: "La contraseña debe tener al menos 6 caracteres",
        param: "passwordOld",
        location: "body",
      });
    }

    if (oldPass == newPass) {
      resultado.errors.push({
        value: newPass,
        msg: "La contraseña nueva no puede ser igual a la anterior",
        param: "passwordNew",
        location: "body",
      });
    }
  }

  if (!resultado.isEmpty()) {
    return res.render("propiedades/editar-perfil", {
      pagina: "Editar Perfil",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      datos: req.body,
      user: req.usuario,
      userId: hashBase64(req.usuario.id.toString()),
    });
  }

  const { id } = req.params;
  const buffer = Buffer.from(id, "base64");
  const idUsuario = buffer.toString("utf-8");

  let users = await Usuario.findAll({
    attributes: ["id", "nombre", "email", "password"],
    raw: true,
  });

  const user = users.filter((user) => {
    return bcrypt.compareSync(user.id.toString(), idUsuario);
  });

  if (user.length === 0) {
    return res.redirect("/404");
  }

  const { nombre, email } = req.body;

  // Hashear el nuevo password
  const salt = await bcrypt.genSalt(10); // rondas de hasheo
  const password = await bcrypt.hash(newPass, salt);

  await Usuario.update(
    {
      nombre,
      email,
      password,
    },
    {
      where: {
        id: user[0].id,
      },
    }
  );

  res.redirect("/mis-propiedades");
};

export {
  inicio,
  categoria,
  noEncontrado,
  buscador,
  editarPerfil,
  guardarCambios,
};
