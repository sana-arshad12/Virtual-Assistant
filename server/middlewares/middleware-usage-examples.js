// Example usage of the authentication middleware

/*
MIDDLEWARE USAGE EXAMPLES:

1. PROTECTED ROUTE (requires authentication):
-----------------------------------------
import { isAuth } from '../middlewares/isAuth.js'

router.get('/protected-route', isAuth, (req, res) => {
  // req.user contains full user object (without password)
  // req.userId contains user ID
  console.log('Authenticated user:', req.user.name)
  res.json({ message: 'This is a protected route', user: req.user })
})

2. OPTIONAL AUTHENTICATION (works with or without auth):
------------------------------------------------------
import { optionalAuth } from '../middlewares/isAuth.js'

router.get('/public-route', optionalAuth, (req, res) => {
  if (req.user) {
    // User is authenticated
    res.json({ message: 'Hello authenticated user', user: req.user })
  } else {
    // User is not authenticated
    res.json({ message: 'Hello anonymous user' })
  }
})

3. FRONTEND TOKEN USAGE:
-----------------------

// Method 1: Authorization Header (Recommended)
fetch('http://localhost:8000/api/user/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

// Method 2: Cookie (if you set cookies)
fetch('http://localhost:8000/api/user/profile', {
  method: 'GET',
  credentials: 'include', // Include cookies
  headers: {
    'Content-Type': 'application/json'
  }
})

4. AVAILABLE ROUTES:
-------------------
GET  /api/user/profile      - Get current user profile (protected)
PUT  /api/user/profile      - Update user profile (protected)
GET  /api/user/history      - Get user's chat history (protected)
GET  /api/user/check-auth   - Check if user is authenticated (optional auth)

5. TOKEN STRUCTURE:
------------------
{
  "userId": "user_id_from_mongodb",
  "iat": timestamp,
  "exp": expiration_timestamp
}

6. MIDDLEWARE RESPONSE FORMAT:
-----------------------------
Success: req.user contains:
{
  _id: ObjectId,
  name: String,
  email: String,
  assistantName: String,
  assistantImage: String,
  history: Array,
  createdAt: Date,
  updatedAt: Date
  // password is excluded
}

Error responses:
{
  "success": false,
  "message": "Error description"
}

7. COMMON STATUS CODES:
----------------------
200 - Success
401 - Unauthorized (no token, invalid token, expired token)
403 - Forbidden (insufficient permissions)
404 - User not found
500 - Server error
*/

export default {
  // This file is for documentation purposes only
  message: "See comments above for usage examples"
}
