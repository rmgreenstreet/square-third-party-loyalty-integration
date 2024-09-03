export const isLoggedIn = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to do that");
        return res.redirect("/login");
    } else {
        next();
    }
}