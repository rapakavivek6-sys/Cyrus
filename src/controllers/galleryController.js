const Artwork = require("../models/Artwork");

exports.getGallery = async (req, res) => {
  try {
    const { tag } = req.query;
    const artworks = await Artwork.findAll({ tag: tag || null });

    res.render("gallery", {
      title: "Gallery - CYRUS",
      artworks,
      selectedTag: tag || "",
    });
  } catch (err) {
    console.error("Gallery error:", err);
    res.render("gallery", {
      title: "Gallery - CYRUS",
      artworks: [],
      errorMessage: "Could not load gallery.",
    });
  }
};
