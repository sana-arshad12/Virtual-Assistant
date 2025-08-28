import React, {createContext, useEffect} from 'react'
export const userDataContext = createContext()

function UserContext({ children }) {
    const serverUrl = "http://localhost:8000"
    const [userData, setUserData] = React.useState(null)

    const handleCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                console.log('No token found, user not authenticated')
                return
            }

            const response = await fetch(`${serverUrl}/api/user/check-auth`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json()
            
            if (response.ok && data.success && data.authenticated) {
                setUserData(data.user)
                console.log('✅ User authenticated:', data.user.name)
            } else {
                console.log('User not authenticated, removing token')
                localStorage.removeItem('token')
                setUserData(null)
            }
        } catch (error) {
            console.error('Error fetching current user:', error)
            localStorage.removeItem('token')
            setUserData(null)
        }
    }

    useEffect(() => {
        handleCurrentUser()
    }, [])

    const value = { serverUrl, userData, setUserData, handleCurrentUser }

    return (
        <userDataContext.Provider value={{ value }}>
            {children}
        </userDataContext.Provider>
    )
}

export default UserContext