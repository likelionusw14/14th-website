import { useState } from 'react'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'

function App() {
    const [userData, setUserData] = useState<any>(null)

    const handleLoginSuccess = (data: any) => {
        setUserData(data)
    }

    const handleLogout = () => {
        setUserData(null)
    }

    return (
        <div className="font-sans antialiased">
            {userData ? (
                <Dashboard data={userData} onLogout={handleLogout} />
            ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
            )}
        </div>
    )
}

export default App
