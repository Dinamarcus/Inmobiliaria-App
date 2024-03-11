import multer from "multer";
import path from "path"; // para trabajar con rutas de archivos. Ejemplo: path.extname para obtener la extensión de un archivo
import { generarId } from "../helpers/generarToken.js";

const storage = multer.diskStorage({
  // Definir destino donde se guardará el archivo
  destination: function (req, file, cb) {
    cb(null, "./public/img");
  },
  // Cambiar el nombre del archivo para que no se repita
  filename: function (req, file, cb) {
    cb(null, generarId() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
});

export default upload;
