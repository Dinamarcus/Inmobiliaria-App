import Express from "express";
import { body } from "express-validator"; //Para definir validacion desde el routing
import {
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
} from "../controllers/propiedadController.js";
import protegerRuta from "../middleware/protegerRuta.js";
import upload from "../middleware/subirArchivo.js";
import identificarUsusario from "../middleware/identificarUsuario.js";

const Router = Express.Router();

Router.get("/mis-propiedades", protegerRuta, admin);
Router.get("/propiedades/crear", protegerRuta, crear);
Router.post(
  "/propiedades/crear",
  protegerRuta,
  body("titulo").notEmpty().withMessage("El titulo no puede ir vacio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripcion no puede ir vacia")
    .isLength({ max: 200 })
    .withMessage("La descripcion no puede tener mas de 10 caracteres"),
  body("categoria").isNumeric().withMessage("Debes seleccionar una categoria"),
  body("precio").isNumeric().withMessage("Debe seleccionar un precio"),
  body("habitaciones")
    .isNumeric()
    .withMessage("Debe seleccionar la cantidad de habitaciones"),
  body("estacionamiento")
    .isNumeric()
    .withMessage("Debe seleccionar la cantidad de estacionamientos"),
  body("wc").isNumeric().withMessage("Debe seleccionar la cantidad de baños"),
  body("lat")
    .notEmpty()
    .withMessage("Debe seleccionar la ubicacion en el mapa"),
  guardar
);

Router.get("/propiedades/agregar-imagen/:id", protegerRuta, agregarImagen);
Router.post(
  "/propiedades/agregar-imagen/:id",
  protegerRuta,
  upload.single("imagen"), // single() es un middleware de multer que se encarga de subir un solo archivo. El nombre del campo debe ser el mismo en el,\
  almacenarImagen
);

Router.get("/propiedades/editar/:id", protegerRuta, editarPropiedad);

Router.post(
  "/propiedades/editar/:id",
  protegerRuta,
  body("titulo").notEmpty().withMessage("El titulo no puede ir vacio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripcion no puede ir vacia")
    .isLength({ max: 200 })
    .withMessage("La descripcion no puede tener mas de 10 caracteres"),
  body("categoria").isNumeric().withMessage("Debes seleccionar una categoria"),
  body("precio").isNumeric().withMessage("Debe seleccionar un precio"),
  body("habitaciones")
    .isNumeric()
    .withMessage("Debe seleccionar la cantidad de habitaciones"),
  body("estacionamiento")
    .isNumeric()
    .withMessage("Debe seleccionar la cantidad de estacionamientos"),
  body("wc").isNumeric().withMessage("Debe seleccionar la cantidad de baños"),
  body("lat")
    .notEmpty()
    .withMessage("Debe seleccionar la ubicacion en el mapa"),
  guardarCambios
);

Router.post("/propiedades/eliminar/:id", protegerRuta, eliminarPropiedad);

Router.put("/propiedades/:id", protegerRuta, cambiarEstado);

//Area Pulbica
Router.get("/propiedad/:id", identificarUsusario, mostrarPropiedad);

Router.post(
  "/propiedad/:id",
  identificarUsusario,
  body("mensaje").notEmpty().withMessage("El mensaje no puede ir vacio"),
  body("mensaje")
    .isLength({ min: 20 })
    .withMessage("El mensaje debe tener minimo 10 caracteres"),
  enviarMensaje
);

Router.get("/mensajes/:id", protegerRuta, verMensajes);

export default Router;
