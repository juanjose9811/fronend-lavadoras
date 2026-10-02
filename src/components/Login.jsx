import React, { useState } from 'react';
import api from '../api/axios';

const Login = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false); // Alternar entre Login y Registro
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/auth/registro' : '/auth/login';

    try {
      const response = await api.post(endpoint, credentials);
      const token = response.data.token;

      if (token) {
        // Guardar token en localStorage
        localStorage.setItem('jwt_token', token);
        if (onLoginSuccess) onLoginSuccess(token);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(typeof err.response.data === 'string' ? err.response.data : 'Error en la autenticación');
      } else {
        setError('No se pudo conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Usuario</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Ej: admin"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Ingresar'}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          <span
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={styles.toggleLink}
          >
            {isRegister ? ' Inicia sesión' : ' Regístrate aquí'}
          </span>
        </p>
      </div>
    </div>
  );
};

// Estilos básicos integrados
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
  },
  card: {
    background: '#ffffff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '380px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#1a202c',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4a5568',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3182ce',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  errorMessage: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  toggleText: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.9rem',
    color: '#718096',
  },
  toggleLink: {
    color: '#3182ce',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default Login;