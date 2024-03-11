(function () {
  const lat = -34.603722;
  const lng = -58.381592;
  const mapa = L.map("mapa-inicio").setView([lat, lng], 11);
  const categoriasSelect = document.querySelector("#categorias");
  const precioSelect = document.querySelector("#precios");

  let markers = new L.FeatureGroup().addTo(mapa);

  let propiedades = [];

  // Filtros
  const filtros = {
    categoria: "",
    precio: "",
  };

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapa);

  // Filtrado de categorias y precios
  categoriasSelect.addEventListener("change", (e) => {
    filtros.categoria = +e.target.value;

    filtrarPropiedades();
  });

  precioSelect.addEventListener("change", (e) => {
    filtros.precio = +e.target.value;

    filtrarPropiedades();
  });

  const obtenerPropiedades = async () => {
    try {
      const url = "/api/propiedades";
      const req = await fetch(url, {
        method: "GET",
      });

      propiedades = await req.json();

      mostrarPropiedades(propiedades);
    } catch (error) {
      console.log(error);
    }
  };

  const mostrarPropiedades = (propiedades) => {
    console.log(propiedades);
    // Limpiar los markers
    markers.clearLayers();

    propiedades.forEach((propiedad) => {
      // Agregar los pines
      const marker = new L.marker([propiedad?.lat, propiedad?.long], {
        autoPan: true,
      }).addTo(mapa).bindPopup(`
        <h3 class="text-center text-xl font-extrabold uppercase my-2">${propiedad?.titulo}</h3>
        <img src="/img/${propiedad?.imagen}" alt="Imagen de la propiedad">
        <p class="text-gray-600 font-bold">Categoria: ${propiedad.categoria.nombre}</p>
        <p class="text-gray-600 font-bold">${propiedad?.descripcion}</p>
        <a href="/propiedad/${propiedad.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase rounded hover:bg-indigo-700 transition-colors duration-300 ease">Ver Propiedad</a>
        `);

      markers.addLayer(marker);
    });
  };

  const filtrarPropiedades = () => {
    const resultado = propiedades
      .filter(filtrarCategoria)
      .filter(filtrarPrecio);

    mostrarPropiedades(resultado);
  };

  const filtrarCategoria = (propiedad) => {
    return filtros.categoria
      ? propiedad.categoriaId === filtros.categoria
      : propiedad;
  };

  const filtrarPrecio = (propiedad) => {
    return filtros.precio ? propiedad.precioId === filtros.precio : propiedad;
  };

  obtenerPropiedades();
})();
