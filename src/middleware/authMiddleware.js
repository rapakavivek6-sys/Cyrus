function ensureAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect("/login");
}

function ensureGuest(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect("/");
  }
  return next();
}

module.exports = { ensureAuth, ensureGuest };
