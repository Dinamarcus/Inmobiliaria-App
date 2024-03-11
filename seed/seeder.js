import { exit } from "node:process";
import categorias from "./categorias.js";
import { Categoria, Precio, Propiedad, Usuario } from "../models/index.js"; // En este caso, se importan dos cosas de un archivo index.js, que es el archivo que se ejecuta por defecto cuando se importa una carpeta. En este caso, se importan las clases Categoria y Precio del archivo index.js que esta en la carpeta models.
import precios from "./precios.js";
import usuarios from "./ususarios.js";
import db from "../config/db.js";

const importarDatos = async () => {
  try {
    //Autenticar
    await db.authenticate();

    //Generar las columnas
    await db.sync();

    //Insertar los datos
    const promiseCategorias = Categoria.bulkCreate(categorias); // Esta funcion es de sequelize, no de node.js. Se usa para insertar datos en la base de datos.

    const promisePrecios = precios.map((precio) => {
      return new Promise((resolve, reject) => {
        Precio.create(precio)
          .then(() => {
            resolve();
          })
          .catch((error) => {
            console.log(error);
            reject();
          });
      });
    }); //Array de promesas

    const promiseUsuarios = Usuario.bulkCreate(usuarios);

    await Promise.allSettled(promisePrecios, promiseCategorias, promiseUsuarios)
      .then(() => {
        console.log("Datos insertados correctamente");
        exit(0);
      })
      .catch((error) => {
        console.log(error);
        exit(1);
      }); // Promise.all es una funcion de node.js que se usa para ejecutar varias promesas al mismo tiempo. En este caso, se ejecutan todas las promesas que se generaron en el map de precios. Al tener el await se ejecutan en simultaneo, y cuando todas terminan, se ejecuta el then. Si alguna falla, se ejecuta el catch.
  } catch (error) {
    console.log(error);
    exit(1);
  }
};

const eliminarDatos = async () => {
  try {
    await db.sync();

    await Propiedad.sequelize.query("SET FOREIGN_KEY_CHECKS = 0", null);
    await Propiedad.truncate();

    const promiseCategorias = await Categoria.destroy({
      where: {},
      truncate: true,
    });
    const promisePrecios = await Precio.destroy({ where: {}, truncate: true });

    const disableFKChecks = await Precio.sequelize.query(
      "SET FOREIGN_KEY_CHECKS = 0",
      null
    );
    const truncatePrecio = await Precio.truncate();
    const enableFKChecks = await Precio.sequelize.query(
      "SET FOREIGN_KEY_CHECKS = 1",
      null
    );
    const enableFKChecksPropiedad = await Propiedad.sequelize.query(
      "SET FOREIGN_KEY_CHECKS = 1",
      null
    );

    Promise.allSettled([
      promiseCategorias,
      promisePrecios,
      disableFKChecks,
      truncatePrecio,
      enableFKChecks,
      enableFKChecksPropiedad,
    ])
      .then(() => {
        console.log("Datos eliminados correctamente");
        process.exit(0);
      })
      .catch((error) => {
        console.log(error);
        process.exit(1);
      });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

if (process.argv[2] === "-i") {
  importarDatos();
} // argv es un array que contiene los argumentos de la linea de comandos. El primer argumento es el nombre del archivo que se esta ejecutando, el segundo argumento es el comando que se le pasa al archivo. En este caso, si el segundo argumento es "-i", se ejecuta la funcion importarDatos. Si no, no se ejecuta nada.

if (process.argv[2] === "-e") {
  eliminarDatos();
}
