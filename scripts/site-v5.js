
    // Chimney Star hero: load one upcoming photo, then crossfade without a blank frame.
    (() => {
      "use strict";

      function initializeHero() {
        const background = document.querySelector("[data-cs-hero-slideshow]");
        if (!background || background.dataset.csHeroReady === "true") return;

        const hero = background.closest(".cs-home-hero");
        const slides = Array.from(background.querySelectorAll(".cs-hero-slideshow__slide"));
        if (!hero || slides.length < 2) return;

        background.dataset.csHeroReady = "true";
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let active = 0;
        let inView = true;
        let pageActive = true;
        let timer = 0;
        let cleanupTimer = 0;

        function load(index) {
          const image = slides[index];
          if (!image.getAttribute("src") && image.dataset.src) image.src = image.dataset.src;
        }

        function mayPlay() {
          return pageActive && inView && !motion.matches && !document.hidden &&
            !document.documentElement.classList.contains("cs-lead-modal-open");
        }

        function settle() {
          window.clearTimeout(cleanupTimer);
          cleanupTimer = 0;
          slides.forEach(slide => slide.classList.remove("is-leaving"));
        }

        function nextIndex() {
          for (let offset = 1; offset < slides.length; offset++) {
            const index = (active + offset) % slides.length;
            if (slides[index].dataset.csFailed !== "true") return index;
          }
          return active;
        }

        function show(index) {
          settle();
          slides[active].classList.replace("is-active", "is-leaving");
          slides[index].classList.add("is-active");
          active = index;
          background.dataset.csHeroIndex = String(active);
          cleanupTimer = window.setTimeout(settle, 1050);
        }

        function schedule() {
          window.clearTimeout(timer);
          timer = 0;
          if (!mayPlay()) return;
          const next = nextIndex();
          if (next === active) return;
          load(next);
          timer = window.setTimeout(advance, 3000);
        }

        function advance() {
          timer = 0;
          if (!mayPlay()) return;
          const next = nextIndex();
          const image = slides[next];
          if (next !== active && image.complete && image.naturalWidth > 0) show(next);
          schedule();
        }

        function sync() {
          if (!mayPlay()) settle();
          schedule();
        }

        slides.forEach((slide, index) => {
          slide.addEventListener("load", () => {
            // Recover even if the first photo fails while animation is paused.
            if (slides[active].dataset.csFailed === "true") {
              show(index);
              sync();
            }
          });
          slide.addEventListener("error", () => {
            slide.dataset.csFailed = "true";
            if (index === active) {
              const next = nextIndex();
              load(next);
              if (next !== active && slides[next].complete && slides[next].naturalWidth > 0) show(next);
            }
            sync();
          });
        });

        document.addEventListener("visibilitychange", sync);
        motion.addEventListener("change", sync);
        new MutationObserver(sync).observe(document.documentElement, {
          attributes: true, attributeFilter: ["class"]
        });
        if ("IntersectionObserver" in window) {
          new IntersectionObserver(entries => {
            inView = entries[0].isIntersecting;
            sync();
          }, { threshold: 0.01 }).observe(hero);
        }
        window.addEventListener("pagehide", () => {
          pageActive = false;
          window.clearTimeout(timer);
          settle();
        });
        window.addEventListener("pageshow", () => { pageActive = true; sync(); });
        background.dataset.csHeroIndex = "0";
        // The first image can have failed before the deferred script executed.
        if (slides[0].complete && slides[0].naturalWidth === 0) {
          slides[0].dataset.csFailed = "true";
          load(nextIndex());
        }
        sync();
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeHero, { once: true });
      } else initializeHero();
    })();

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

;

    (() => {
      "use strict";

      const bar = document.querySelector("[data-cs-lead-bar]");
      const modal = document.querySelector("[data-cs-lead-modal]");
      const sticky = document.querySelector("[data-cs-lead-sticky]");

      if (!bar || !modal || !sticky || modal.dataset.csLeadReady === "true") return;

      modal.dataset.csLeadReady = "true";

      const panel = modal.querySelector("[data-cs-lead-panel]");
      const closeButton = modal.querySelector("[data-cs-lead-close]");
      const form = modal.querySelector("[data-cs-preview-form]");
      const stickyForm = sticky.querySelector("[data-cs-sticky-form]");
      const status = modal.querySelector("[data-cs-lead-status]");
      const resetButton = modal.querySelector("[data-cs-lead-reset]");
      const openButtons = Array.from(document.querySelectorAll("[data-cs-lead-open]"));
      const timerNodes = Array.from(document.querySelectorAll("[data-cs-lead-timer]"));
      const expiryKey = "cs_first_time_offer_expiry_59m_v1";
      const invitationKey = "cs_first_time_offer_invitation_seen_v1";
      const duration = 59 * 60 * 1000;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

      let expiry = Date.now() + duration;
      let timer = 0;
      let invitationTimer = 0;
      let isOpen = false;
      let previousFocus = null;
      let stickyFrame = 0;

      const readExpiry = () => {
        try {
          const stored = Number(window.localStorage.getItem(expiryKey));

          if (Number.isSafeInteger(stored) && stored > Date.now()) {
            expiry = stored;
          } else {
            expiry = Date.now() + duration;
            window.localStorage.setItem(expiryKey, String(expiry));
          }
        } catch (_) {
          expiry = Date.now() + duration;
        }
      };

      const tick = () => {
        window.clearTimeout(timer);

        if (expiry <= Date.now()) {
          expiry = Date.now() + duration;

          try {
            window.localStorage.setItem(expiryKey, String(expiry));
          } catch (_) {
            // Continue with an in-memory timer when storage is unavailable.
          }
        }

        const seconds = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
        const display = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

        timerNodes.forEach((node) => {
          node.textContent = display;
        });

        if (!document.hidden) timer = window.setTimeout(tick, 1000);
      };

      const syncBarHeight = () => {
        const height = Math.max(44, Math.ceil(bar.getBoundingClientRect().height));
        document.documentElement.style.setProperty("--cs-lead-bar-height", `${height}px`);
      };

      const syncSticky = () => {
        stickyFrame = 0;

        const header = document.querySelector("[data-cs-header]");
        if (!header) return;

        const headerBottom = Math.max(0, Math.ceil(header.getBoundingClientRect().bottom));
        const menuOpen = header.classList.contains("is-menu-open");
        const shouldShow = window.scrollY > 300 && !menuOpen && !isOpen;

        document.documentElement.style.setProperty("--cs-lead-sticky-top", `${headerBottom}px`);
        sticky.classList.toggle("is-visible", shouldShow);
        sticky.setAttribute("aria-hidden", shouldShow ? "false" : "true");

        if (shouldShow) {
          sticky.removeAttribute("inert");
        } else {
          sticky.setAttribute("inert", "");
        }
      };

      const scheduleSticky = () => {
        if (stickyFrame) return;
        stickyFrame = window.requestAnimationFrame(syncSticky);
      };

      const focusable = () => {
        return Array.from(
          panel.querySelectorAll("a[href], button, input, select, textarea, [tabindex]")
        ).filter((node) => {
          return !node.disabled && node.tabIndex >= 0 && node.getClientRects().length > 0;
        });
      };

      const rememberInvitation = () => {
        try {
          window.sessionStorage.setItem(invitationKey, "true");
        } catch (_) {
          // A blocked session store should not block the offer controls.
        }
      };

      const openModal = () => {
        if (isOpen) return;

        const menuToggle = document.querySelector("[data-cs-menu-toggle][aria-expanded='true']");
        if (menuToggle) menuToggle.click();

        window.clearTimeout(invitationTimer);
        rememberInvitation();
        previousFocus = document.activeElement;
        isOpen = true;

        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        document.documentElement.classList.add("cs-lead-modal-open");

        window.requestAnimationFrame(() => {
          modal.classList.add("is-open");
          closeButton.focus({ preventScroll: true });
        });

        scheduleSticky();
      };

      const closeModal = (restoreFocus = true) => {
        if (!isOpen) return;

        isOpen = false;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("cs-lead-modal-open");

        const finish = () => {
          if (!isOpen) modal.hidden = true;
        };

        if (reducedMotion.matches) {
          finish();
        } else {
          window.setTimeout(finish, 190);
        }

        if (restoreFocus && previousFocus && previousFocus.isConnected) {
          previousFocus.focus({ preventScroll: true });
        }

        scheduleSticky();
      };

      openButtons.forEach((button) => {
        button.addEventListener("click", openModal);
      });

      closeButton.addEventListener("click", () => closeModal());

      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
      });

      document.addEventListener("keydown", (event) => {
        if (!isOpen) return;

        if (event.key === "Escape") {
          event.preventDefault();
          closeModal();
          return;
        }

        if (event.key !== "Tab") return;

        const nodes = focusable();
        const first = nodes[0];
        const last = nodes[nodes.length - 1];

        if (!first) {
          event.preventDefault();
          panel.focus();
          return;
        }

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });

      document.addEventListener("focusin", (event) => {
        if (isOpen && !panel.contains(event.target)) closeButton.focus();
      });

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        form.reset();
        form.hidden = true;
        status.hidden = false;
        resetButton.focus();
      });

      stickyForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!stickyForm.reportValidity()) return;

        const stickyName = stickyForm.elements.namedItem("sticky-name");
        const stickyPhone = stickyForm.elements.namedItem("sticky-phone");
        const modalName = form.elements.namedItem("name-1");
        const modalPhone = form.elements.namedItem("phone-1");

        if (modalName) modalName.value = stickyName.value;
        if (modalPhone) modalPhone.value = stickyPhone.value;

        stickyForm.reset();
        openModal();
      });

      resetButton.addEventListener("click", () => {
        status.hidden = true;
        form.hidden = false;
        window.requestAnimationFrame(() => {
          form.querySelector("input")?.focus();
        });
      });

      const invite = () => {
        let seen = false;

        try {
          seen = window.sessionStorage.getItem(invitationKey) === "true";
        } catch (_) {
          seen = false;
        }

        if (seen || isOpen) return;

        const active = document.activeElement;
        const editing = active && active.closest("input, textarea, select, [contenteditable='true']");
        const menuOpen = document.querySelector("[data-cs-header].is-menu-open");

        if (document.hidden || editing || menuOpen) {
          invitationTimer = window.setTimeout(invite, 1200);
          return;
        }

        openModal();
      };

      const beginInvitation = () => {
        invitationTimer = window.setTimeout(invite, 8000);
      };

      if (document.readyState === "complete") {
        beginInvitation();
      } else {
        window.addEventListener("load", beginInvitation, { once: true });
      }

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          window.clearTimeout(timer);
        } else {
          readExpiry();
          tick();
        }
      });

      window.addEventListener("storage", (event) => {
        if (event.key === expiryKey || event.key === null) {
          readExpiry();
          tick();
        }
      });

      window.addEventListener("pagehide", () => {
        window.clearTimeout(timer);
        window.clearTimeout(invitationTimer);
        closeModal(false);
      });

      window.addEventListener("resize", syncBarHeight, { passive: true });
      window.addEventListener("resize", scheduleSticky, { passive: true });
      window.addEventListener("scroll", scheduleSticky, { passive: true });

      if ("ResizeObserver" in window) {
        const observer = new ResizeObserver(syncBarHeight);
        observer.observe(bar);

        const stickyObserver = new ResizeObserver(scheduleSticky);
        stickyObserver.observe(bar);
        stickyObserver.observe(document.querySelector("[data-cs-header]"));
      }

      readExpiry();
      tick();
      syncBarHeight();
      syncSticky();
    })();
