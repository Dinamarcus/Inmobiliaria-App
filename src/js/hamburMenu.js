(function () {
  const button = document.querySelector("#check");

  button.addEventListener("click", () => {
    const nav = document.querySelector(".menu-nav");
    const menu = document.querySelector(".menu");
    const menuSearch = document.querySelector(".menu-search");
    const menuSearchBar = document.querySelector(".menu-search__bar");
    const menuSearchBut = document.querySelector(".menu-search__but");
    menuSearchBar.classList.add("translate-y-0");
    menuSearchBar.classList.add("translate-y-0");

    menu.classList.toggle("hidden");
    menuSearch.classList.toggle("opacity-0");
    menuSearch.classList.add("opacity-100");

    if (!menu.classList.contains("hidden")) {
      document.querySelectorAll(".menu-item").forEach((item) => {
        item.classList.add("translate-y-0");
        item.classList.add("opacity-1");

        setTimeout(() => {
          item.classList.remove("opacity-0");

          setTimeout(() => {
            item.classList.remove("-translate-y-24");
            setTimeout(() => {
              menuSearchBar.classList.remove("-translate-y-24");

              setTimeout(() => {
                menuSearchBar.classList.remove("opacity-0");

                setTimeout(() => {
                  menuSearchBut.classList.remove("-translate-y-24");

                  setTimeout(() => {
                    menuSearchBut.classList.remove("opacity-0");
                  }, 100);
                }, 200);
              }, 100);
            }, 200);
            setTimeout(() => {
              nav.classList.remove("pointer-events-none");
            }, 200);
          }, 100);
        }, 100);
      });
    } else {
      document.querySelectorAll(".menu-item").forEach((item) => {
        item.classList.add("-translate-y-24");
        item.classList.add("opacity-0");
        setTimeout(() => {
          item.classList.remove("opacity-1");
          setTimeout(() => {
            item.classList.remove("translate-y-0");
            setTimeout(() => {
              nav.classList.add("pointer-events-none");
            }, 100);
          }, 100);
        }, 100);
      });

      menuSearch.classList.add("opacity-0");
      menuSearchBar.classList.add("-translate-y-24");
      menuSearchBar.classList.add("opacity-0");
      menuSearchBut.classList.add("-translate-y-24");
      menuSearchBut.classList.add("opacity-0");
      menuSearchBut.classList.add("-translate-y-24");
    }
  });
})();
