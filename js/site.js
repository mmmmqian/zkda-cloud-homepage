(() => {
  document.documentElement.classList.add("js");
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(year);
  });

  const header = document.querySelector("[data-site-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const primaryNav = document.querySelector("[data-primary-nav]");

  if (header && menuToggle && primaryNav) {
    const setMenu = (open) => {
      primaryNav.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.querySelector("span").textContent = open ? "关闭" : "菜单";
    };

    menuToggle.addEventListener("click", () => {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    header.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        header.querySelectorAll("details[open]").forEach((item) => item.removeAttribute("open"));
        setMenu(false);
        menuToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) setMenu(false);
    });
  }
})();
