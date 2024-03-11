import { Sequelize } from "sequelize";
import { Buffer } from "node:buffer";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { Precio, Categoria, Propiedad, Usuario } from "../models/index.js";

const inicio = async (req, res) => {
  const { _token: token } = req.cookies;
  const authenticated = token ? true : false;

  console.log(req);

  const [categorias, precios, casas, departamentos] = await Promise.all([
    Categoria.findAll({ raw: true }),
    Precio.findAll({ raw: true }),
    Propiedad.findAll({
      limit: 3,
      order: [["createdAt", "DESC"]],
      where: {
        categoriaId: 1,
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
    id,
    csrfToken: req.csrfToken(),
  });
};

const noEncontrado = async (req, res) => {
  res.render("404", {
    pagina: "Pagina no encontrada",
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
  });
};

const guardarCambios = async (req, res) => {
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);

    return res.render("propiedades/editar", {
      pagina: "Editar Propiedad",
      csrfToken: req.csrfToken(),
      categorias,
      precios,
      errores: resultado.array(),
      datos: req.body,
      userId: hashBase64(req.usuario.id.toString()),
    });
  }

  const { id } = req.params;
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

  const { nombre, email } = req.body;

  await Usuario.update(
    {
      nombre,
      email,
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
