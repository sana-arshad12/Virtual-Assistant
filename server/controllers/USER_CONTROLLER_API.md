# User Controller API Documentation

## Overview
This controller handles all user-related operations after JWT token verification. The `req.userId` is automatically extracted from the JWT token by the `isAuth` middleware.

## Authentication Flow
1. Client sends JWT token in Authorization header: `Bearer <token>`
2. `isAuth` middleware verifies the token and extracts `userId`
3. Controller functions use `req.userId` to perform user-specific operations

---

## API Endpoints

### 1. Get User Profile
**GET** `/api/user/profile`
- **Auth Required:** Yes
- **Description:** Get current user's profile information
- **Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "assistantName": "My Assistant",
    "assistantImage": "image_url",
    "history": [],
    "createdAt": "2025-08-28T...",
    "updatedAt": "2025-08-28T..."
  }
}
```

### 2. Update User Profile
**PUT** `/api/user/profile`
- **Auth Required:** Yes
- **Body:**
```json
{
  "name": "New Name",
  "assistantName": "New Assistant Name",
  "assistantImage": "new_image_url"
}
```
- **Response:** Updated user profile

### 3. Change Password
**PUT** `/api/user/change-password`
- **Auth Required:** Yes
- **Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 4. Get Chat History
**GET** `/api/user/history?page=1&limit=10`
- **Auth Required:** Yes
- **Query Params:** 
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Response:**
```json
{
  "success": true,
  "message": "Chat history retrieved successfully",
  "history": [
    {
      "id": 1693456789,
      "message": "Hello",
      "response": "Hi there!",
      "timestamp": "2025-08-28T..."
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalItems": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 5. Add Chat to History
**POST** `/api/user/history`
- **Auth Required:** Yes
- **Body:**
```json
{
  "message": "User's message",
  "response": "Assistant's response",
  "timestamp": "2025-08-28T..." // optional
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Chat added to history successfully",
  "chatEntry": { /* chat entry */ },
  "totalChats": 15
}
```

### 6. Clear Chat History
**DELETE** `/api/user/history`
- **Auth Required:** Yes
- **Response:**
```json
{
  "success": true,
  "message": "Chat history cleared successfully"
}
```

### 7. Get Dashboard Statistics
**GET** `/api/user/dashboard`
- **Auth Required:** Yes
- **Response:**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "stats": {
    "totalChats": 25,
    "accountAge": 30,
    "recentChats": [/* last 5 chats */],
    "chatsByMonth": {
      "2025-08": 15,
      "2025-07": 10
    },
    "lastActivity": "2025-08-28T..."
  }
}
```

### 8. Verify Token
**GET** `/api/user/verify-token`
- **Auth Required:** Yes
- **Description:** Check if the current token is still valid
- **Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "assistantName": "My Assistant"
  }
}
```

### 9. Delete User Account
**DELETE** `/api/user/account`
- **Auth Required:** Yes
- **Body:**
```json
{
  "password": "user_password"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### 10. Check Authentication Status
**GET** `/api/user/check-auth`
- **Auth Required:** No (optional auth)
- **Description:** Check if user is authenticated without throwing errors
- **Response:**
```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "assistantName": "My Assistant"
  }
}
```

---

## Error Responses

### Common Error Codes
- **400:** Bad Request (validation errors, missing fields)
- **401:** Unauthorized (invalid/expired token)
- **404:** Not Found (user not found)
- **500:** Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Additional error details"] // optional
}
```

---

## Usage Examples

### Frontend JavaScript Examples

#### Get User Profile
```javascript
const getUserProfile = async () => {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    if (data.success) {
      console.log('User:', data.user)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
```

#### Update Profile
```javascript
const updateProfile = async (profileData) => {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    })
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error:', error)
  }
}
```

#### Add Chat to History
```javascript
const addChatToHistory = async (message, response) => {
  try {
    const response = await fetch('/api/user/history', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        response,
        timestamp: new Date().toISOString()
      })
    })
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error:', error)
  }
}
```

---

## Key Features

✅ **JWT Integration:** All functions use `req.userId` from JWT token verification
✅ **Comprehensive Error Handling:** Proper error messages and status codes
✅ **Data Validation:** Input validation for all endpoints
✅ **Pagination:** Chat history supports pagination
✅ **Security:** Password verification for sensitive operations
✅ **Statistics:** Dashboard stats with chat analytics
✅ **Logging:** Console logs for debugging and monitoring
✅ **Flexible Updates:** Only update provided fields in profile updates
