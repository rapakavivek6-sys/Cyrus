const User = require("../models/User");
const Artwork = require("../models/Artwork");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await User.findById(userId);
    const artworks = await Artwork.findByUser(userId);

    res.render("profile", {
      title: "My Profile - CYRUS",
      profileUser: user,
      artworks,
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.render("profile", {
      title: "My Profile - CYRUS",
      profileUser: req.session.user,
      artworks: [],
      errorMessage: "Could not load profile.",
    });
  }
};

exports.getEditProfile = async (req, res) => {
  const user = await User.findById(req.session.user.id);
  res.render("profile", {
    title: "Edit Profile - CYRUS",
    profileUser: user,
    editMode: true,
  });
};

exports.postEditProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const id = req.session.user.id;

    await User.updateProfile(id, { name, bio });

    req.session.user.name = name;
    req.session.user.bio = bio;

    res.redirect("/profile");
  } catch (err) {
    console.error("Update profile error:", err);
    res.redirect("/profile");
  }
};
