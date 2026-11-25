(function () {
  const menu = document.getElementById("course-menu");
  const lessons = document.getElementById("course-lessons");
  const template = document.getElementById("module-card-template");
  let closeActiveVideo;

  async function videoUrl(lesson, signal) {
    if (!lesson.bunnyId) {
      return `https://www.loom.com/embed/${encodeURIComponent(lesson.loomId)}`;
    }
    const response = await fetch(`/api/video?guid=${encodeURIComponent(lesson.bunnyId)}`, { signal });
    if (!response.ok) throw new Error("Video no disponible");
    const { url } = await response.json();
    if (!url) throw new Error("Falta la URL del video");
    return url;
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

      const video = card.querySelector(".video-embed");
      const iframe = video.querySelector("iframe");
      iframe.remove();
      iframe.title = lesson.title;
      const status = video.querySelector(".video-status");
      const button = status.querySelector(".video-load");

      function showError() {
        iframe.remove();
        status.hidden = false;
        status.textContent = "El video no cargó, recargá la página";
      }
      iframe.addEventListener("error", showError);

      button.addEventListener("click", async () => {
        closeActiveVideo?.();
        const controller = new AbortController();
        closeActiveVideo = () => {
          controller.abort();
          iframe.remove();
          iframe.removeAttribute("src");
          status.replaceChildren(button);
          status.hidden = false;
        };

        status.textContent = "Cargando video…";
        try {
          const url = await videoUrl(lesson, controller.signal);
          if (controller.signal.aborted) return;
          iframe.src = url;
          iframe.hidden = false;
          video.append(iframe);
          status.hidden = true;
        } catch {
          if (!controller.signal.aborted) showError();
        }
      });
      section.append(card);
    }
  }
})();
