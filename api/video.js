const { createHash } = require("node:crypto");
const modules = require("../assets/js/modules-data.js");

const allowedGuids = new Set(
  modules.flatMap((module) => module.lessons.map((lesson) => lesson.bunnyId)).filter(Boolean)
);

module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const guid = req.query?.guid;
  if (!allowedGuids.has(guid)) {
    return res.status(404).json({ error: "Video no encontrado" });
  }

  const { BUNNY_STREAM_LIBRARY_ID: libraryId, BUNNY_STREAM_TOKEN_KEY: key } = process.env;
  if (!key || !/^\d+$/.test(libraryId ?? "")) {
    return res.status(500).json({ error: "Video no disponible" });
  }

  const expires = Math.floor(Date.now() / 1000) + 3600;
  const token = createHash("sha256").update(key + guid + expires).digest("hex");
  const url = `https://iframe.mediadelivery.net/embed/${libraryId}/${guid}?token=${token}&expires=${expires}`;
  return res.status(200).json({ url });
};
