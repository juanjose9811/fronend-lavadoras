import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Lavadoras from './components/Lavadoras';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Verificar si ya existe un token en la sesión al cargar la página
    const savedToken = localStorage.getItem('jwt_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setToken(null);
  };

  return (
    <div>
      {!token ? (
        <Login onLoginSuccess={(newToken) => setToken(newToken)} />
      ) : (
        <Lavadoras onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;