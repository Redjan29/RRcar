import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export function authMiddleware(req, res, next) {
  try {
    // Récupération du token depuis le header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const err = new Error("No token provided");
      err.status = 401;
      throw err;
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérification du token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Ajout des infos utilisateur à la requête
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      error.message = "Invalid token";
      error.status = 401;
    } else if (error.name === "TokenExpiredError") {
      error.message = "Token expired";
      error.status = 401;
    }
    next(error);
  }
}

// Middleware optionnel : récupère l'utilisateur s'il est connecté, mais n'exige pas de token
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // On ignore les erreurs pour l'auth optionnelle
    next();
  }
}
