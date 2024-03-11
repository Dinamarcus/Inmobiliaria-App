(function () {
  const lat = document.querySelector("#lat").textContent;
  const lng = document.querySelector("#long").textContent;
  const calle = document.querySelector("#calle").textContent;
  const titulo = document.querySelector("#titulo").textContent;
  const mapa = L.map("mapa").setView([lat, lng], 16);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapa);

  // Agregar el pin
  L.marker([lat, lng])
    .addTo(mapa)
    .bindPopup(
      `
    <h3 class="font-bold text-center">${titulo}</h3>
    <p class="font-medium">Direccion: ${calle}</p>
        `
    );

  document.querySelector("#mapa").classList.add("rounded-md");
})();
