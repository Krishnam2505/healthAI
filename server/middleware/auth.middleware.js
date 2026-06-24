import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    // 1. Read the Authorization header from the incoming request
    const authHeader = req.headers.authorization;

    // 2. Check if it exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // 3. Extract the token (everything after 'Bearer ')
    // authHeader looks like "Bearer eyJhbGciOiJIUzI1Ni..."
    // Splitting by space and taking the 2nd part gives us just the token string.
    const token = authHeader.split(' ')[1];

    // 4. Verify the token using the secret key
    // WHAT THIS DOES:
    // - Signature Check: It mathematically verifies that this token was actually created by OUR server (using process.env.JWT_SECRET) and hasn't been tampered with by a hacker.
    // - Expiry Check: It automatically reads the token's built-in expiration timestamp. If the current time is past the expiry date, it immediately throws an error.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. If verification succeeds, attach the decoded userId to the request object
    // This allows our protected routes to know exactly which user is making the request!
    req.userId = decoded.userId;
    
    // Pass control to the next middleware or the actual route handler
    next();

  } catch (error) {
    // 6. If verification fails (e.g., token is expired or fake), jwt.verify throws an error and we jump to this catch block
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
