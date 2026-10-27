// MOTOR — arma la página a partir de MODULES (modules-data.js).
// No tocar para cambiar el diseño: eso va en assets/css/style.css e index.html.
(function () {
  const container = document.getElementById("module-list");
  const template = document.getElementById("module-card-template");

  const modules = [...MODULES].sort((a, b) => a.order - b.order);

  modules.forEach((module) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".module-title").textContent = module.title;
    node.querySelector("iframe").src = `https://www.loom.com/embed/${module.loomId}`;
    node.querySelector(".module-card").id = module.id;
    container.appendChild(node);
  });
})();
