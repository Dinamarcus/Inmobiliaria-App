(function () {
  const button = document.getElementById("guardarCambios");

  button.addEventListener("click", function (e) {
    console.log("click");

    button.setAttribute("disabled", "true");
    button.style.filter = "grayscale(100%)";
  });
})();
