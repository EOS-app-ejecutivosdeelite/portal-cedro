(function () {
  const menu = document.getElementById("course-menu");
  const lessons = document.getElementById("course-lessons");
  const template = document.getElementById("module-card-template");
  const loadVideo = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      entry.target.querySelector(".video-load").click();
    }
  }, { rootMargin: "200px" });

  async function showVideo(lesson, iframe, status) {
    status.textContent = "Cargando video…";
    try {
      if (lesson.bunnyId) {
        const response = await fetch(`/api/video?guid=${encodeURIComponent(lesson.bunnyId)}`);
        if (!response.ok) throw new Error("Video no disponible");
        const { url } = await response.json();
        if (!url) throw new Error("Falta la URL del video");
        iframe.src = url;
      } else {
        iframe.src = `https://www.loom.com/embed/${encodeURIComponent(lesson.loomId)}`;
      }
      iframe.hidden = false;
      status.hidden = true;
    } catch {
      status.textContent = "El video no cargó, recargá la página";
    }
  }

  for (const module of MODULES) {
    const menuGroup = document.createElement("div");
    const menuTitle = document.createElement("p");
    menuTitle.className = "sidebar-label";
    menuTitle.textContent = module.title;
    menuGroup.append(menuTitle);
    menu.append(menuGroup);

    const section = document.createElement("section");
    section.className = "course-module";
    const title = document.createElement("h2");
    title.id = `modulo-${module.lessons[0].number.split(".")[0]}`;
    title.textContent = module.title;
    section.setAttribute("aria-labelledby", title.id);
    section.append(title);
    lessons.append(section);

    for (const lesson of module.lessons) {
      const card = template.content.firstElementChild.cloneNode(true);
      card.id = `clase-${lesson.number.replace(".", "-")}`;
      card.querySelector(".module-marker").textContent = lesson.number;
      card.querySelector(".module-title").textContent = lesson.title;
      card.querySelector(".lesson-duration").textContent = `${lesson.minutes} min`;

      const link = document.createElement("a");
      link.href = `#${card.id}`;
      link.append(`${lesson.number} `);
      const label = document.createElement("span");
      label.textContent = lesson.title;
      const badge = document.createElement("small");
      badge.className = "lesson-seen";
      badge.textContent = "vista";
      link.append(label, badge);
      menuGroup.append(link);

      const key = `cedro_lesson_seen_${lesson.bunnyId || lesson.loomId}`;
      const markSeen = card.querySelector(".mark-seen");
      function setSeen(seen) {
        badge.hidden = !seen;
        markSeen.setAttribute("aria-pressed", String(seen));
        markSeen.textContent = seen ? "Clase vista" : "Marcar como vista";
      }
      setSeen(localStorage.getItem(key) === "1");
      markSeen.addEventListener("click", () => {
        const seen = badge.hidden;
        if (seen) localStorage.setItem(key, "1");
        else localStorage.removeItem(key);
        setSeen(seen);
      });

      const iframe = card.querySelector("iframe");
      iframe.title = lesson.title;
      const status = card.querySelector(".video-status");
      iframe.addEventListener("error", () => {
        iframe.hidden = true;
        status.hidden = false;
        status.textContent = "El video no cargó, recargá la página";
      });
      const video = card.querySelector(".video-embed");
      video.querySelector(".video-load").addEventListener("click", () => showVideo(lesson, iframe, status), { once: true });
      section.append(card);
      loadVideo.observe(video);
    }
  }
})();
