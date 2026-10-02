import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Lavadoras = ({ onLogout }) => {
  const [lavadoras, setLavadoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Estado para el formulario (crear/editar)
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    precio: '',
    cantidad: '',
    capacidad: ''
  });

  const [editingId, setEditingId] = useState(null);

  // 1. Cargar la lista de lavadoras al montar el componente
  useEffect(() => {
    cargarLavadoras();
  }, []);

  const cargarLavadoras = async () => {
    try {
      setLoading(true);
      const response = await api.get('/lavadoras');
      setLavadoras(response.data);
      setError('');
    } catch (err) {
      setError('Error al obtener la lista de lavadoras');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error del campo que se está editando
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  // 2. Guardar (Crear o Actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSuccessMessage('');

    // Preparar objeto numérico
    const payload = {
      ...formData,
      precio: parseFloat(formData.precio),
      cantidad: parseInt(formData.cantidad, 10),
      capacidad: formData.capacidad ? parseInt(formData.capacidad, 10) : null
    };

    try {
      if (editingId) {
        // Petición PUT (Actualizar)
        await api.put(`/lavadoras/${editingId}`, payload);
        setSuccessMessage('Lavadora actualizada con éxito');
      } else {
        // Petición POST (Crear)
        await api.post('/lavadoras', payload);
        setSuccessMessage('Lavadora registrada con éxito');
      }

      limpiarFormulario();
      cargarLavadoras();
    } catch (err) {
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        // Errores de validación devueltos por el GlobalExceptionHandler (@Valid)
        setFieldErrors(err.response.data);
      } else {
        setError('Ocurrió un error al guardar los datos');
      }
    }
  };

  // 3. Seleccionar lavadora para editar
  const handleEdit = (lavadora) => {
    setEditingId(lavadora.id);
    setFormData({
      marca: lavadora.marca || '',
      modelo: lavadora.modelo || '',
      precio: lavadora.precio || '',
      cantidad: lavadora.cantidad || '',
      capacidad: lavadora.capacidad || ''
    });
    setFieldErrors({});
    setSuccessMessage('');
  };

  // 4. Eliminar lavadora
  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta lavadora?')) return;

    try {
      await api.delete(`/lavadoras/${id}`);
      setSuccessMessage('Lavadora eliminada correctamente');
      cargarLavadoras();
    } catch (err) {
      setError('No se pudo eliminar el registro');
    }
  };

  const limpiarFormulario = () => {
    setFormData({ marca: '', modelo: '', precio: '', cantidad: '', capacidad: '' });
    setEditingId(null);
    setFieldErrors({});
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Gestión de Tienda de Lavadoras 🧺</h2>
        <button onClick={onLogout} style={styles.logoutBtn}>Cerrar Sesión</button>
      </header>

      {/* Mensajes de feedback */}
      {successMessage && <div style={styles.successAlert}>{successMessage}</div>}
      {error && <div style={styles.errorAlert}>{error}</div>}

      <div style={styles.grid}>
        {/* Formulario */}
        <div style={styles.card}>
          <h3>{editingId ? 'Editar Lavadora' : 'Agregar Lavadora'}</h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <label style={styles.label}>Marca</label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ej: Haceb, LG, Whirlpool"
              />
              {fieldErrors.marca && <span style={styles.fieldError}>{fieldErrors.marca}</span>}
            </div>

            <div>
              <label style={styles.label}>Modelo</label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ej: Smart Inverter"
              />
              {fieldErrors.modelo && <span style={styles.fieldError}>{fieldErrors.modelo}</span>}
            </div>

            <div>
              <label style={styles.label}>Precio ($)</label>
              <input
                type="number"
                step="0.01"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ej: 1500000"
              />
              {fieldErrors.precio && <span style={styles.fieldError}>{fieldErrors.precio}</span>}
            </div>

            <div>
              <label style={styles.label}>Cantidad (Stock)</label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ej: 10"
              />
              {fieldErrors.cantidad && <span style={styles.fieldError}>{fieldErrors.cantidad}</span>}
            </div>

            <div>
              <label style={styles.label}>Capacidad (Kg)</label>
              <input
                type="number"
                name="capacidad"
                value={formData.capacidad}
                onChange={handleChange}
                style={styles.input}
                placeholder="Ej: 18"
              />
              {fieldErrors.capacidad && <span style={styles.fieldError}>{fieldErrors.capacidad}</span>}
            </div>

            <div style={styles.btnGroup}>
              <button type="submit" style={styles.saveBtn}>
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              {editingId && (
                <button type="button" onClick={limpiarFormulario} style={styles.cancelBtn}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabla de registros */}
        <div style={styles.card}>
          <h3>Catálogo de Lavadoras</h3>
          {loading ? (
            <p>Cargando datos...</p>
          ) : lavadoras.length === 0 ? (
            <p>No hay lavadoras registradas aún.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Marca</th>
                  <th style={styles.th}>Modelo</th>
                  <th style={styles.th}>Precio</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Capacidad</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lavadoras.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.id}</td>
                    <td style={styles.td}>{item.marca}</td>
                    <td style={styles.td}>{item.modelo}</td>
                    <td style={styles.td}>${item.precio}</td>
                    <td style={styles.td}>{item.cantidad}</td>
                    <td style={styles.td}>
                      {item.capacidad ? `${item.capacidad} Kg` : 'N/A'}
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => handleEdit(item)} style={styles.editBtn}>✏️</button>
                      <button onClick={() => handleDelete(item.id)} style={styles.deleteBtn}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// Estilos
const styles = {
  container: { padding: '20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' },
  logoutBtn: { backgroundColor: '#e53e3e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' },
  card: { background: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { fontSize: '0.85rem', fontWeight: 'bold', color: '#4a5568', display: 'block', marginBottom: '4px' },
  input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', boxSizing: 'border-box' },
  fieldError: { color: '#e53e3e', fontSize: '0.75rem', marginTop: '2px', display: 'block' },
  btnGroup: { display: 'flex', gap: '10px', marginTop: '10px' },
  saveBtn: { backgroundColor: '#3182ce', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', flex: 1 },
  cancelBtn: { backgroundColor: '#a0aec0', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { backgroundColor: '#f7fafc', padding: '10px', textAlign: 'left', borderBottom: '2px solid #cbd5e0', fontSize: '0.85rem' },
  td: { padding: '10px', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' },
  editBtn: { backgroundColor: '#ecc94b', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
  deleteBtn: { backgroundColor: '#feb2b2', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' },
  successAlert: { backgroundColor: '#c6f6d5', color: '#22543d', padding: '10px', borderRadius: '6px', marginBottom: '15px' },
  errorAlert: { backgroundColor: '#fed7d7', color: '#742a2a', padding: '10px', borderRadius: '6px', marginBottom: '15px' }
};

export default Lavadoras;