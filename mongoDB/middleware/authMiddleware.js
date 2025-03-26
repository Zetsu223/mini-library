const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract the token from Authorization header

    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }

        req.user = user; // Attach the decoded user info to the request
        next(); // Proceed to the next middleware or route handler
    });
}

module.exports = authenticateToken;
