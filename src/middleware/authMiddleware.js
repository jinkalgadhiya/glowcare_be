const checkAuth = (req, res, next) => {
    const isLoggedIn = true;

    if (!isLoggedIn) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    next();
};

module.exports = {
    checkAuth
};