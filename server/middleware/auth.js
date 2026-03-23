const { auth, db } = require("../firebase");

/**
 * Firebase Auth Middleware
 * Verifies the ID token and attaches the user profile from Firestore.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized: No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 1. Verify Firebase ID Token
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 2. Fetch User Profile from Firestore
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: "User profile not found." });
    }

    const userData = userDoc.data();

    // 3. Attach User Info to Request
    req.user = {
      uid,
      email: decodedToken.email,
      role: userData.role || "customer",
      status: userData.status || "pending",
      ...userData
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error ❌:", error.message);
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid token." });
  }
};

/**
 * Role-Based Access Control Middleware
 * @param {Array} allowedRoles - List of roles permitted to access the route
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Forbidden: Access restricted to ${allowedRoles.join(", ")}.` 
      });
    }
    next();
  };
};

module.exports = { authMiddleware, authorize };
