(function () {
  const lat = document.querySelector("#lat").value || -34.603722;
  const lng = document.querySelector("#long").value || -58.381592;
  const mapa = L.map("mapa").setView([lat, lng], 11);
  let marker;

  // Utilizar Provider y Geocoder
  const geocodeService = L.esri.Geocoding.geocodeService();

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapa);

  //El pin
  marker = new L.marker([lat, lng], {
    draggable: true, //permite mover el pin
    autoPan: true, //centra el mapa
  }).addTo(mapa);

  marker.on("moveend", function (e) {
    marker = e.target;

    const posicion = marker.getLatLng(); //obtiene la posicion

    mapa.panTo(new L.LatLng(posicion.lat, posicion.lng)); //centra el mapa

    // Obtener la informacion de las calles al soltar el pin
    geocodeService
      .reverse()
      .latlng(posicion, 13)
      .run(function (error, resultado) {
        console.log(resultado);

        marker.bindPopup(resultado.address.LongLabel).openPopup();

        // Llenar los campos
        document.querySelector(".calle").textContent =
          resultado?.address?.Address ?? "";
        document.querySelector("#calle").value =
          resultado?.address?.Address ?? "";
        document.querySelector("#lat").value = resultado?.latlng?.lat ?? "";
        document.querySelector("#long").value = resultado?.latlng?.lng ?? "";
      });
  });
})();
