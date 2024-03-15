import path from "path";

export default {
  mode: "development",
  entry: {
    mapa: "./src/js/mapa.js",
    agregarImagen: "./src/js/agregarImagen.js",
    generateToast: "./src/js/generateToast.js",
    mostrarMapa: "./src/js/mostrarMapa.js",
    mapaInicio: "./src/js/mapaInicio.js",
    cambiarEstado: "./src/js/cambiarEstado.js",
    hamburMenu: "./src/js/hamburMenu.js",
    swiper: "./src/js/swiper.js",
    disableInput: "./src/js/disableInput.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve("public/js"),
  },
};
