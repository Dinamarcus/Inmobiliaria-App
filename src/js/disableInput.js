(function () {
  const button = document.getElementById("guardarCambios");

  button.addEventListener("click", function (e) {
    e.preventDefault();

    button.setAttribute("disabled", "true");
    button.style.filter = "grayscale(100%)";
  });
})();
