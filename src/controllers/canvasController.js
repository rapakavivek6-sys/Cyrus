const Artwork = require("../models/Artwork");

exports.getCanvas = (req, res) => {
  res.render("canvas", {
    title: "Canvas - CYRUS",
  });
};

exports.postSaveCanvas = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { title, description, tag } = req.body;

    await Artwork.create({
      title: title || "Untitled Canvas",
      description: description || "Saved from collaborative canvas.",
      image_url: "/images/sample-art-1.jpg", // placeholder
      tag: tag || "event",
      pixels_count: 1000,
      contributors_count: 1,
      user_id: userId,
    });

    res.redirect("/gallery");
  } catch (err) {
    console.error("Save canvas error:", err);
    res.redirect("/canvas");
  }
};
