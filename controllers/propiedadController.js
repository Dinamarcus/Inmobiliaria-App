import path from "node:path"; // Para trabajar con rutas de archivos
import FirebaseAdmin from "firebase-admin";
import { validationResult } from "express-validator"; // Para acceder al resultado de la validacion definida en el routing
import { generarId } from "../helpers/generarToken.js";

import {
  Propiedad,
  Categoria,
  Precio,
  Mensaje,
  Usuario,
} from "../models/index.js";
import { esVendedor, formatearFecha } from "../middleware/index.js";
import hashBase64 from "../helpers/hashBase64.js";

const admin = async (req, res) => {
  // Leer queryString
  const { page: actualPage } = req.query;

  const expresion = /^[0-9]+$/; // Regular expression to validate that the value is a number

  if (!expresion.test(actualPage)) {
    res.redirect("/mis-propiedades?page=1");
  }

  try {
    const { id } = req.usuario;

    const limit = 10;
    const actualPageNumber = parseInt(actualPage, 10);
    const offset = actualPageNumber * limit - limit;

    const [propiedades, total] = await Promise.all([
      Propiedad.findAll({
        limit,
        offset,
        where: {
          usuarioId: id,
        },
        include: [
          {
            model: Categoria,
            as: "categoria",
          },
          {
            model: Precio,
            as: "precio",
          },
          {
            model: Mensaje,
            as: "mensajes",
          },
        ],
      }),
      Propiedad.count({
        where: {
          usuarioId: id,
        },
      }),
    ]);

    res.render("propiedades/admin", {
      propiedades,
      pagina: "Mis Propiedades",
      csrfToken: req.csrfToken(),
      paginas: Math.ceil(total / limit),
      actualPage: actualPageNumber,
      total,
      offset,
      limit,
      userId: hashBase64(req.usuario.id.toString()),
    });
  } catch (error) {
    console.log(error);
  }
};

//Formulario para crear propiedad
const crear = async (req, res) => {
  //consultar las categorias
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll(),
  ]); // Al poner await Promise.all, se ejecutan las dos promesas al mismo tiempo. Esto es mas eficiente que ejecutarlas por separado.

  res.render("propiedades/crear", {
    pagina: "Crear Propiedad",
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    datos: {},
    userId: hashBase64(req.usuario.id.toString()),
  });
};

const guardar = async (req, res) => {
  // Resultado de la validacion
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    const [categorias, precios] = await Promise.all([
      Categoria.findAll(),
      Precio.findAll(),
    ]);

    return res.render("propiedades/crear", {
      pagina: "Crear Propiedad",
      categorias,
      precios,
      errores: resultado.array(),
      csrfToken: req.csrfToken(),
      datos: req.body,
      userId: hashBase64(req.usuario.id.toString()),
    });
  } // Si hay errores quiero mostrarlos en pantalla pero ademas quiero que se mantengan los valores que el usuario ingreso en el formulario para que no tenga que volver a escribirlos.

  // Crear un registro
  const {
    titulo,
    descripcion,
    habitaciones,
    estacionamiento,
    wc,
    calle,
    lat,
    long,
    precio: precioId, // Cambio de nombre para evitar confusión
    categoria: categoriaId,
  } = req.body;

  const { id: usuarioId } = req.usuario;

  try {
    const propiedadGuardada = await Propiedad.create({
      titulo,
      descripcion,
      habitaciones,
      wc,
      estacionamiento,
      lat,
      long,
      calle,
      categoriaId,
      precioId,
      usuarioId,
      imagen: "",
    });

    const { id } = propiedadGuardada;

    res.redirect(`/propiedades/agregar-imagen/${id}`);
  } catch (error) {
    console.log(error);
  }
};

const agregarImagen = async (req, res) => {
  const { id } = req.params;

  // Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    res.redirect("/mis-propiedades");
  }

  // Validar que la propiedad no este publicada
  if (propiedad.publicado) {
    return res.redirect("/mis-propiedades");
  }

  // Validar que el usuario sea el propietario
  if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
    return res.redirect("/mis-propiedades");
  }

  res.render("propiedades/agregar-imagen", {
    pagina: `Agregar Imagen: ${propiedad.titulo}`,
    propiedad,
    csrfToken: req.csrfToken(),
    userId: hashBase64(req.usuario.id.toString()),
  });
};

const almacenarImagen = async (req, res, next) => {
  const { id } = req.params;

  // Validar que la propiedad exista
  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    res.redirect("/mis-propiedades");
  }

  // Validar que la propiedad no este publicada
  if (propiedad.publicado) {
    return res.redirect("/mis-propiedades");
  }

  // Validar que el usuario sea el propietario
  if (req.usuario.id.toString() !== propiedad.usuarioId.toString()) {
    return res.redirect("/mis-propiedades");
  }

  try {
    // Subir la imagen a Firebase
    const { buffer, originalname } = req.file;

    const newFilename = generarId() + path.extname(originalname);

    const bucket = FirebaseAdmin.storage().bucket();
    const blob = bucket.file(newFilename);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on("error", (err) => {
      console.error(err);
      next(err);
    });

    blobStream.on("finish", async () => {
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURI(blob.name)}?alt=media`;

      // Guardar la URL de la imagen en la base de datos
      propiedad.imagen = publicUrl;
      propiedad.publicado = 1;

      await propiedad.save();

      res.redirect("/mis-propiedades");
    });

    blobStream.end(buffer);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const editarPropiedad = async (req, res) => {
  const { id } = req.params;

  // Validar que existe la propiedad
  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    res.redirect("/mis-propiedades");
  }

  // Revisar que quien edita sea el propietario

  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect("/mis-propiedades");
  }

  //consultar las categorias
  const [categorias, precios] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll(),
  ]); // Al poner await Promise.all, se ejecutan las dos promesas al mismo tiempo. Esto es mas eficiente que ejecutarlas por separado.

  console.log(propiedad);

  return res.render("propiedades/editar", {
    pagina: `Editar Propiedad ${propiedad.titulo}`,
    csrfToken: req.csrfToken(),
    categorias,
    precios,
    datos: propiedad,
    userId: hashBase64(req.usuario.id.toString()),
  });
};

const guardarCambios = async (req, res) => {
  // Resultado de la validacion
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
  } // Si hay errores quiero mostrarlos en pantalla pero ademas quiero que se mantengan los valores que el usuario ingreso en el formulario para que no tenga que volver a escribirlos.

  const { id } = req.params;

  // Validar que existe la propiedad
  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    res.redirect("/mis-propiedades");
  }

  // Revisar que quien edita sea el propietario
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect("/mis-propiedades");
  }

  // Reescribir el objeto

  try {
    const {
      titulo,
      descripcion,
      habitaciones,
      estacionamiento,
      wc,
      calle,
      lat,
      long,
      precio: precioId, // Cambio de nombre para evitar confusión
      categoria: categoriaId,
    } = req.body;

    propiedad.set({
      titulo,
      descripcion,
      habitaciones,
      wc,
      estacionamiento,
      lat,
      long,
      calle,
      categoriaId,
      precioId,
    });

    await propiedad.save();

    res.redirect("/mis-propiedades");
  } catch (e) {
    console.log(e);
  }
};

const eliminarPropiedad = async (req, res) => {
  const { id } = req.params;

  // Validar que existe la propiedad
  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    res.redirect("/mis-propiedades");
  }

  // Revisar que quien edita sea el propietario
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect("/mis-propiedades");
  }

  try {
    if (propiedad.imagen) {
      // Eliminar la imagen de Firebase Storage
      const bucket = FirebaseAdmin.storage().bucket();
      const imageUrl = new URL(propiedad.imagen);
      const fileName = path.basename(imageUrl.pathname); // obtener el nombre del archivo de la URL
      await bucket.file(fileName).delete();
    }

    // Eliminar la propiedad de la base de datos
    await propiedad.destroy();

    res.redirect("/mis-propiedades");
  } catch (error) {
    console.log(error);
  }
};

// Cambiar estado de la propiedad
const cambiarEstado = async (req, res) => {
  const { id } = req.params;

  // Validar que existe la propiedad
  const propiedad = await Propiedad.findByPk(id);

  if (!propiedad) {
    res.redirect("/mis-propiedades");
  }

  // Revisar que quien edita sea el propietario
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect("/mis-propiedades");
  }

  // Actualizar
  propiedad.publicado = !propiedad.publicado;

  await propiedad.save();

  res.json({ resultado: true });
};

//Muestra una propiedad
const mostrarPropiedad = async (req, res) => {
  const { id } = req.params;
  let authenticated = true;

  if (!req.usuario) {
    authenticated = false;
  }

  //Comprobar que la propiedad existe
  const propiedad = await Propiedad.findByPk(id, {
    include: [
      {
        model: Categoria,
        as: "categoria",
      },
      {
        model: Precio,
        as: "precio",
      },
    ],
  });

  if (!propiedad || !propiedad.publicado) {
    return res.redirect("/404");
  }

  res.render("propiedades/mostrar", {
    propiedad,
    pagina: propiedad.titulo,
    csrfToken: req.csrfToken(),
    usuario: req.usuario,
    esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
    authenticated,
  });
};

const enviarMensaje = async (req, res) => {
  const { id } = req.params;

  //Comprobar que la propiedad existe
  const propiedad = await Propiedad.findByPk(id, {
    include: [
      {
        model: Categoria,
        as: "categoria",
      },
      {
        model: Precio,
        as: "precio",
      },
    ],
  });

  if (!propiedad) {
    return res.redirect("/404");
  }

  // Renderizar errores si es que los hay
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return res.render("propiedades/mostrar", {
      propiedad,
      pagina: propiedad.titulo,
      csrfToken: req.csrfToken(),
      usuario: req.usuario,
      esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
      errores: resultado.array(),
      userId: hashBase64(req.usuario.id.toString()),
    });
  }

  const { mensaje } = req.body;
  const { id: propiedadId } = req.params;
  const { id: usuarioId } = req.usuario;

  // Almacenar mensaje
  await Mensaje.create({
    mensaje,
    usuarioId,
    propiedadId,
  });

  res.redirect("/");
};

//Leer mensajes recibidos
const verMensajes = async (req, res) => {
  const { id } = req.params;

  // Validar que existe la propiedad
  const propiedad = await Propiedad.findByPk(id, {
    include: [
      {
        model: Mensaje,
        as: "mensajes",
        include: [{ model: Usuario.scope("eliminarPassword"), as: "usuario" }],
      },
    ],
  });

  if (!propiedad) {
    res.redirect("/mis-propiedades");
  }

  // Revisar que quien edita sea el propietario
  if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
    res.redirect("/mis-propiedades");
  }

  res.render("propiedades/mensajes", {
    pagina: "Mensajes",
    csrfToken: req.csrfToken(),
    mensajes: propiedad.mensajes,
    formatearFecha,
    userId: hashBase64(req.usuario.id.toString()),
  });
};

export {
  admin,
  crear,
  guardar,
  agregarImagen,
  almacenarImagen,
  editarPropiedad,
  guardarCambios,
  eliminarPropiedad,
  mostrarPropiedad,
  enviarMensaje,
  verMensajes,
  cambiarEstado,
};
