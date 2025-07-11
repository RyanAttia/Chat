import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized - No Token Provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
    return res.status(401).json({ error: "Unauthorized - No Token Provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "Unauthorized - User Not Found" });
    }
    req.user = user;

    next();

  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);

    if (
      error.name === "JsonWebTokenError" || 
      error.name === "TokenExpiredError" ||
      error.message === "jwt malformed"
    ) {
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

export default protectRoute;
