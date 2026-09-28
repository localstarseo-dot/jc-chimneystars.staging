
    (() => {
      const track = document.querySelector("[data-cs-timeline]");

      if (!track || track.dataset.csTimelineReady === "true") {
        return;
      }

      track.dataset.csTimelineReady = "true";

      const items = Array.from(
        track.querySelectorAll("[data-cs-timeline-item]")
      );

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

      let ticking = false;

      const clamp = (number, minimum, maximum) => {
        return Math.min(Math.max(number, minimum), maximum);
      };

      const updateTimeline = () => {
        ticking = false;

        if (reducedMotion.matches) {
          track.style.setProperty("--cs-timeline-progress", "1");
          items.forEach((item) => item.classList.add("is-active"));
          return;
        }

        const rect = track.getBoundingClientRect();
        const viewportHeight =
          window.innerHeight || document.documentElement.clientHeight;

        const startPoint = viewportHeight * 0.72;
        const endPoint = viewportHeight * 0.28;
        const totalDistance = rect.height + startPoint - endPoint;
        const travelledDistance = startPoint - rect.top;
        const progress = clamp(
          travelledDistance / totalDistance,
          0,
          1
        );

        track.style.setProperty(
          "--cs-timeline-progress",
          progress.toFixed(4)
        );

        const activePosition = progress * track.offsetHeight;

        items.forEach((item) => {
          const itemCenter = item.offsetTop + item.offsetHeight * 0.5;
          item.classList.toggle(
            "is-active",
            itemCenter <= activePosition + 45
          );
        });
      };

      const requestTimelineUpdate = () => {
        if (ticking) {
          return;
        }

        ticking = true;
        window.requestAnimationFrame(updateTimeline);
      };

      window.addEventListener(
        "scroll",
        requestTimelineUpdate,
        { passive: true }
      );

      window.addEventListener(
        "resize",
        requestTimelineUpdate,
        { passive: true }
      );

      if (typeof reducedMotion.addEventListener === "function") {
        reducedMotion.addEventListener(
          "change",
          requestTimelineUpdate
        );
      }

      if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(requestTimelineUpdate);
        observer.observe(track);
      }

      requestTimelineUpdate();
    })();

;

    (() => {
      "use strict";
      const header = document.querySelector("[data-cs-header]");
      const nav = document.querySelector("[data-cs-nav]");
      const toggle = document.querySelector("[data-cs-menu-toggle]");
      const details = [...header.querySelectorAll(".cs-nav-details")];
      const mobileQuery = window.matchMedia("(max-width: 1024px)");

      if (!header || !nav || !toggle) return;

      const syncMobilePanel = () => {
        if (!mobileQuery.matches) return;
        const headerBottom = Math.max(0, Math.round(header.getBoundingClientRect().bottom));
        document.documentElement.style.setProperty("--cs-mobile-nav-top", `${headerBottom}px`);
      };

      const closeMenu = (returnFocus = false) => {
        header.classList.remove("is-menu-open");
        document.documentElement.classList.remove("cs-nav-locked");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation menu");
        details.forEach((item) => item.removeAttribute("open"));
        if (returnFocus) toggle.focus();
      };

      const openMenu = () => {
        syncMobilePanel();
        header.classList.add("is-menu-open");
        document.documentElement.classList.add("cs-nav-locked");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close navigation menu");
        window.requestAnimationFrame(() => nav.querySelector("a, summary")?.focus());
      };

      toggle.addEventListener("click", () => {
        header.classList.contains("is-menu-open") ? closeMenu() : openMenu();
      });

      details.forEach((item) => {
        item.addEventListener("toggle", () => {
          if (!item.open) return;
          details.forEach((other) => {
            if (other !== item) other.removeAttribute("open");
          });
        });
      });

      nav.addEventListener("click", (event) => {
        if (mobileQuery.matches && event.target.closest("a")) closeMenu();
      });

      document.addEventListener("click", (event) => {
        if (!header.contains(event.target)) {
          details.forEach((item) => item.removeAttribute("open"));
          if (mobileQuery.matches) closeMenu();
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        const hadOpenMenu = header.classList.contains("is-menu-open");
        details.forEach((item) => item.removeAttribute("open"));
        if (hadOpenMenu) closeMenu(true);
      });

      mobileQuery.addEventListener("change", () => closeMenu());
      window.addEventListener("resize", () => {
        if (header.classList.contains("is-menu-open")) syncMobilePanel();
      }, { passive: true });

      const updateScrolledState = () => header.classList.toggle("is-scrolled", window.scrollY > 16);
      updateScrolledState();
      window.addEventListener("scroll", updateScrolledState, { passive: true });
    })();
