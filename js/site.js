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
    const navGroups = Array.from(primaryNav.querySelectorAll("details"));
    const desktopHover = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
    let closeTimer = 0;

    const closeGroups = (except = null) => {
      window.clearTimeout(closeTimer);
      navGroups.forEach((item) => {
        if (item !== except) item.removeAttribute("open");
      });
    };

    const openGroup = (item) => {
      window.clearTimeout(closeTimer);
      closeGroups(item);
      item.setAttribute("open", "");
    };

    const queueClose = (item) => {
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        if (!item.matches(":hover") && !item.contains(document.activeElement)) {
          item.removeAttribute("open");
        }
      }, 140);
    };

    const setMenu = (open) => {
      primaryNav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.querySelector("span").textContent = open ? "关闭" : "菜单";
      if (!open) closeGroups();
    };

    navGroups.forEach((item) => {
      const summary = item.querySelector("summary");

      item.addEventListener("toggle", () => {
        if (item.open) closeGroups(item);
      });

      summary?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        if (item.open) {
          item.removeAttribute("open");
        } else {
          openGroup(item);
        }
      });

      item.addEventListener("pointerenter", () => {
        if (desktopHover.matches) openGroup(item);
      });

      item.addEventListener("pointerleave", () => {
        if (desktopHover.matches) queueClose(item);
      });

    });

    menuToggle.addEventListener("click", () => {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const openGroup = navGroups.find((item) => item.open);
        const menuWasOpen = menuToggle.getAttribute("aria-expanded") === "true";
        setMenu(false);

        if (window.innerWidth <= 900 && menuWasOpen) {
          menuToggle.focus();
        } else if (openGroup) {
          openGroup.querySelector("summary")?.focus();
        }
      }
    });

    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) {
        closeGroups();
        if (window.innerWidth <= 900) setMenu(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) setMenu(false);
    });
  }
})();
