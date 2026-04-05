/* ============================================================
   Art Museum of Greater Lafayette — Main JS
   ============================================================ */

"use strict";

/* ── DOM Ready ── */
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initExhibitSlider();
  initStickyHeader();
  initNewsletterForms();

  // Lock scroll immediately so the donate slide plays before the user
  // can interact with the page.
  document.body.style.overflow = "hidden";

  // Double-rAF: let the browser commit the initial off-screen state of
  // .btn-donate-top in frames 1-2, then enable transitions/animations
  // and kick off the slide in the same callback.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add("transitions-ready");
      initDonateSlide();
    });
  });
});

/* ============================================================
   MOBILE MENU
   ============================================================ */
function initMobileMenu() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!hamburgerBtn || !mobileMenu) return;

  hamburgerBtn.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");

    hamburgerBtn.classList.toggle("open", isOpen);
    hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
    hamburgerBtn.setAttribute(
      "aria-label",
      isOpen ? "Close Menu" : "Open Menu",
    );
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  });

  // Close menu when a link inside it is clicked
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      hamburgerBtn.classList.remove("open");
      hamburgerBtn.setAttribute("aria-expanded", "false");
      hamburgerBtn.setAttribute("aria-label", "Open Menu");
      mobileMenu.setAttribute("aria-hidden", "true");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      mobileMenu.classList.contains("open") &&
      !mobileMenu.contains(e.target) &&
      !hamburgerBtn.contains(e.target)
    ) {
      mobileMenu.classList.remove("open");
      hamburgerBtn.classList.remove("open");
      hamburgerBtn.setAttribute("aria-expanded", "false");
      hamburgerBtn.setAttribute("aria-label", "Open Menu");
      mobileMenu.setAttribute("aria-hidden", "true");
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("open")) {
      mobileMenu.classList.remove("open");
      hamburgerBtn.classList.remove("open");
      hamburgerBtn.setAttribute("aria-expanded", "false");
      hamburgerBtn.setAttribute("aria-label", "Open Menu");
      mobileMenu.setAttribute("aria-hidden", "true");
      hamburgerBtn.focus();
    }
  });
}

/* ============================================================
   EXHIBIT SLIDER
   ============================================================ */
function initExhibitSlider() {
  const slider = document.getElementById("exhibitSlider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".exhibit-slide"));
  const dots = Array.from(slider.querySelectorAll(".slider-dot"));
  const prevBtn = document.getElementById("sliderPrev");
  const nextBtn = document.getElementById("sliderNext");

  if (slides.length === 0) return;

  let currentIndex = 0;
  let autoPlayTimer = null;
  const AUTO_PLAY_INTERVAL = 10000; // ms

  /* ── Core: show slide by index ── */
  function goToSlide(index) {
    // Wrap around
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    // Hide current
    slides[currentIndex].classList.remove("active");
    if (dots[currentIndex]) {
      dots[currentIndex].classList.remove("active");
      dots[currentIndex].setAttribute("aria-selected", "false");
    }

    // Show new
    currentIndex = index;
    slides[currentIndex].classList.add("active");
    if (dots[currentIndex]) {
      dots[currentIndex].classList.add("active");
      dots[currentIndex].setAttribute("aria-selected", "true");
    }

    // Announce to screen readers
    slider.setAttribute(
      "aria-label",
      `Exhibit Slideshow — Slide ${currentIndex + 1} of ${slides.length}`,
    );
  }

  /* ── Prev / Next buttons ── */
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      goToSlide(currentIndex - 1);
      resetAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      goToSlide(currentIndex + 1);
      resetAutoPlay();
    });
  }

  /* ── Dot navigation ── */
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goToSlide(i);
      resetAutoPlay();
    });
  });

  /* ── Keyboard navigation on slider region ── */
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      goToSlide(currentIndex - 1);
      resetAutoPlay();
    } else if (e.key === "ArrowRight") {
      goToSlide(currentIndex + 1);
      resetAutoPlay();
    }
  });

  /* ── Auto-play ── */
  function startAutoPlay() {
    autoPlayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, AUTO_PLAY_INTERVAL);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  /* ── Pause auto-play when user hovers over slider ── */
  slider.addEventListener("mouseenter", () => clearInterval(autoPlayTimer));
  slider.addEventListener("mouseleave", startAutoPlay);

  /* ── Pause when page is not visible (tab switching) ── */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(autoPlayTimer);
    } else {
      startAutoPlay();
    }
  });

  /* ── Touch / swipe support ── */
  let touchStartX = null;
  let touchStartY = null;
  const SWIPE_THRESHOLD = 50;

  slider.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true },
  );

  slider.addEventListener(
    "touchend",
    (e) => {
      if (touchStartX === null) return;

      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;

      // Only treat as horizontal swipe if x movement is dominant
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > SWIPE_THRESHOLD
      ) {
        if (deltaX < 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
        resetAutoPlay();
      }

      touchStartX = null;
      touchStartY = null;
    },
    { passive: true },
  );

  // Kick off auto-play
  startAutoPlay();
}

/* ============================================================
   DONATE SLIDE-IN
   ============================================================ */
function initDonateSlide() {
  const btn = document.querySelector(".btn-donate-top");
  if (!btn) return;

  // Add the class that triggers the CSS @keyframes animation.
  // All timing and easing live in the stylesheet — nothing is
  // hard-coded here.
  btn.classList.add("animate-in");

  // Unlock scroll the moment the button settles into place.
  btn.addEventListener(
    "animationend",
    () => {
      document.body.style.overflow = "";
    },
    { once: true },
  );
}

/* ============================================================
   STICKY HEADER — shrink on scroll
   ============================================================ */
function initStickyHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;

  // Tuck the top bar away almost immediately — 10px means the user barely
  // has to scroll before the donate strip collapses and the nav compacts.
  const SCROLL_THRESHOLD = 10;

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  // Do NOT call onScroll() on load here — let the transitions-ready
  // double-rAF run first so the initial state is painted without animation.
  // We schedule it on the next tick instead.
  setTimeout(onScroll, 0);
}

/* ============================================================
   NEWSLETTER FORMS — basic client-side feedback
   ============================================================ */
function initNewsletterForms() {
  const forms = document.querySelectorAll(
    ".newsletter-form, .footer-newsletter-form",
  );

  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button[type="submit"]');

      if (!input || !input.value.trim()) return;

      const originalBtnText = btn.textContent;

      // Simulate submission feedback
      btn.textContent = "Subscribed!";
      btn.disabled = true;
      input.value = "";
      input.disabled = true;

      // Style the confirmation state
      btn.style.backgroundColor = "#4a7c59";
      btn.style.borderColor = "#4a7c59";
      btn.style.color = "#ffffff";

      // Reset after a few seconds
      setTimeout(() => {
        btn.textContent = originalBtnText;
        btn.disabled = false;
        input.disabled = false;
        btn.style.backgroundColor = "";
        btn.style.borderColor = "";
        btn.style.color = "";
      }, 4000);
    });
  });
}
