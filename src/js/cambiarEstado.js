(function () {
  const cambiarEstadoBotones = document.querySelectorAll(".cambiar-estado");
  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  cambiarEstadoBotones.forEach((boton) => {
    boton.addEventListener("click", cambiarEstadoPropiedad);
  });

  async function cambiarEstadoPropiedad(e) {
    const { propiedadId: id } = e.target.dataset;

    try {
      const url = `/propiedades/${id}`;
      const req = await fetch(url, {
        method: "PUT",
        headers: {
          "CSRF-Token": token,
        },
      });
      const { resultado } = await req.json();

      if (resultado) {
        if (e.target.classList.contains("bg-indigo-100")) {
          e.target.classList.add("bg-green-100", "text-green-800");
          e.target.classList.remove("bg-indigo-100", "text-indigo-800");
          e.target.textContent = "Publicado";
        } else {
          e.target.classList.remove("bg-green-100", "text-green-800");
          e.target.classList.add("bg-indigo-100", "text-indigo-800");
          e.target.textContent = "No Publicado";
          b;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
})();
