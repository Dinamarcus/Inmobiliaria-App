import Sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const db = new Sequelize(
  process.env.DB_NOMBRE,
  process.env.DB_USUARIO,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    define: {
      timestamps: true, // para que cree las columnas de created_at y updated_at
    },
    pool: {
      max: 20, // maximo de conexiones
      min: 0, // minimo de conexiones
      acquire: 30000, // tiempo maximo de espera para una conexion en milisegundos
      idle: 10000, // tiempo maximo de inactividad de una conexion en milisegundos
    },
    opperatorAliases: false, // para que no tire warnings
  }
);

export default db;
