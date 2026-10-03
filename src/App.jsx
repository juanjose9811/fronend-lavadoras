import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:8080/api";
const IMAGEN_DEFECTO = "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&auto=format&fit=crop&q=80";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [rol, setRol] = useState(localStorage.getItem("rol") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  const [isRegister, setIsRegister] = useState(false);
  const [authData, setAuthData] = useState({ username: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");

  const [lavadoras, setLavadoras] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [factura, setFactura] = useState(null);

  // Pedidos
  const [misPedidos, setMisPedidos] = useState([]);
  const [todosLosPedidos, setTodosLosPedidos] = useState([]);
  const [vistaAdmin, setVistaAdmin] = useState("inventario"); // 'inventario' o 'pedidos'
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroPrecioMax, setFiltroPrecioMax] = useState("");
  const [filtroCapacidadMin, setFiltroCapacidadMin] = useState("");

  // Formulario Admin
  const [formLavadora, setFormLavadora] = useState({
    id: null,
    marca: "",
    modelo: "",
    precio: "",
    cantidad: "",
    capacidad: "",
    imagenUrl: ""
  });
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    if (token) {
      cargarLavadoras();
      if (rol === "ROLE_CLIENTE") {
        cargarMisPedidos();
      } else if (rol === "ROLE_ADMIN") {
        cargarTodosLosPedidos();
      }
    }
  }, [token, rol]);

  const cargarLavadoras = async () => {
    try {
      const res = await fetch(`${API_URL}/lavadoras`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLavadoras(data);
      }
    } catch (err) {
      console.error("Error al cargar lavadoras:", err);
    }
  };

  const cargarMisPedidos = async () => {
    try {
      const res = await fetch(`${API_URL}/pedidos/mis-pedidos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMisPedidos(data);
      }
    } catch (err) {
      console.error("Error al cargar mis pedidos:", err);
    }
  };

  const cargarTodosLosPedidos = async () => {
    try {
      const res = await fetch(`${API_URL}/pedidos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTodosLosPedidos(data);
      }
    } catch (err) {
      console.error("Error al cargar todos los pedidos:", err);
    }
  };

  const cambiarEstadoPedido = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`${API_URL}/pedidos/${id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        cargarTodosLosPedidos();
      }
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  const aplicarFiltros = async (e) => {
    if (e) e.preventDefault();
    try {
      const params = new URLSearchParams();
      if (filtroTexto) params.append("texto", filtroTexto);
      if (filtroPrecioMax) params.append("precioMax", filtroPrecioMax);
      if (filtroCapacidadMin) params.append("capacidadMin", filtroCapacidadMin);

      const res = await fetch(`${API_URL}/lavadoras/buscar?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLavadoras(data);
      }
    } catch (err) {
      console.error("Error al filtrar:", err);
    }
  };

  const limpiarFiltros = () => {
    setFiltroTexto("");
    setFiltroPrecioMax("");
    setFiltroCapacidadMin("");
    cargarLavadoras();
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    const endpoint = isRegister ? "/auth/registro" : "/auth/login";

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData)
      });

      if (!res.ok) throw new Error("Credenciales inválidas o error en la petición.");

      if (isRegister) {
        alert("Usuario registrado con éxito.");
        setIsRegister(false);
      } else {
        const data = await res.json();
        const userToken = data.token;
        const userRol = data.rol || (authData.username.toLowerCase() === "admin" ? "ROLE_ADMIN" : "ROLE_CLIENTE");

        localStorage.setItem("token", userToken);
        localStorage.setItem("rol", userRol);
        localStorage.setItem("username", authData.username);

        setToken(userToken);
        setRol(userRol);
        setUsername(authData.username);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken("");
    setRol("");
    setUsername("");
    setCarrito([]);
    setFactura(null);
    setMisPedidos([]);
    setTodosLosPedidos([]);
    setMostrarHistorial(false);
  };

  const handleGuardarLavadora = async (e) => {
    e.preventDefault();
    const metodo = editando ? "PUT" : "POST";
    const url = editando ? `${API_URL}/lavadoras/${formLavadora.id}` : `${API_URL}/lavadoras`;

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formLavadora)
      });

      if (res.ok) {
        cargarLavadoras();
        resetForm();
      }
    } catch (err) {
      console.error("Error al guardar lavadora:", err);
    }
  };

  const handleEditar = (lav) => {
    setFormLavadora({
      id: lav.id,
      marca: lav.marca || "",
      modelo: lav.modelo || "",
      precio: lav.precio || "",
      cantidad: lav.cantidad || "",
      capacidad: lav.capacidad || "",
      imagenUrl: lav.imagenUrl || ""
    });
    setEditando(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta lavadora?")) return;
    try {
      const res = await fetch(`${API_URL}/lavadoras/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) cargarLavadoras();
    } catch (err) {
      console.error("Error al eliminar lavadora:", err);
    }
  };

  const resetForm = () => {
    setFormLavadora({ id: null, marca: "", modelo: "", precio: "", cantidad: "", capacidad: "", imagenUrl: "" });
    setEditando(false);
  };

  const agregarAlCarrito = (lavadora) => {
    const existe = carrito.find((item) => item.lavadora.id === lavadora.id);
    if (existe) {
      setCarrito(
        carrito.map((item) =>
          item.lavadora.id === lavadora.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      );
    } else {
      setCarrito([...carrito, { lavadora, cantidad: 1 }]);
    }
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter((item) => item.lavadora.id !== id));
  };

  const vaciarCarrito = () => setCarrito([]);

  const realizarCheckout = async () => {
    if (carrito.length === 0) return alert("El carrito está vacío");

    const payload = {
      items: carrito.map((item) => ({
        lavadoraId: item.lavadora.id,
        cantidad: item.cantidad
      }))
    };

    try {
      const res = await fetch(`${API_URL}/pedidos/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const dataFactura = await res.json();
        setFactura(dataFactura);
        setCarrito([]);
        cargarLavadoras();
        cargarMisPedidos();
      } else {
        alert("Error al procesar la compra.");
      }
    } catch (err) {
      console.error("Error en checkout:", err);
    }
  };

  // LOGIN / REGISTRO
  if (!token) {
    return (
      <div className="container mt-5" style={{ maxWidth: "420px" }}>
        <div className="card shadow-sm p-4 border-0 rounded-3">
          <h3 className="text-center mb-4 fw-bold text-primary">
            {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
          </h3>
          {authError && <div className="alert alert-danger py-2">{authError}</div>}
          <form onSubmit={handleAuth}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Usuario</label>
              <input
                type="text"
                className="form-control"
                required
                value={authData.username}
                onChange={(e) => setAuthData({ ...authData, username: e.target.value })}
              />
            </div>
            {isRegister && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={authData.email}
                  onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                />
              </div>
            )}
            <div className="mb-3">
              <label className="form-label fw-semibold">Contraseña</label>
              <input
                type="password"
                className="form-control"
                required
                value={authData.password}
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2 mb-2 fw-semibold">
              {isRegister ? "Registrarse" : "Entrar"}
            </button>
          </form>
          <button
            className="btn btn-link w-100 text-decoration-none text-muted"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate aquí"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4">
      {/* HEADER */}
      <header className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded shadow-sm border">
        <div>
          <h3 className="m-0 fw-bold">Gestión de Tienda de Lavadoras 🧺</h3>
          <small className="text-muted">
            Usuario: <strong>{username}</strong> | Rol:{" "}
            <span className={`badge ${rol === "ROLE_ADMIN" ? "bg-danger" : "bg-success"}`}>
              {rol}
            </span>
          </small>
        </div>
        <div>
          {rol === "ROLE_ADMIN" && (
            <div className="btn-group me-2">
              <button
                className={`btn btn-sm ${vistaAdmin === "inventario" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setVistaAdmin("inventario")}
              >
                📦 Inventario
              </button>
              <button
                className={`btn btn-sm ${vistaAdmin === "pedidos" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => {
                  cargarTodosLosPedidos();
                  setVistaAdmin("pedidos");
                }}
              >
                📋 Gestión de Pedidos ({todosLosPedidos.length})
              </button>
            </div>
          )}

          {rol === "ROLE_CLIENTE" && (
            <button
              className="btn btn-outline-primary btn-sm me-2 fw-semibold"
              onClick={() => {
                if (mostrarHistorial) {
                  setMostrarHistorial(false);
                } else {
                  cargarMisPedidos();
                  setMostrarHistorial(true);
                }
              }}
            >
              {mostrarHistorial ? "🛒 Ver Catálogo" : `📋 Mis Pedidos (${misPedidos.length})`}
            </button>
          )}

          <button onClick={handleLogout} className="btn btn-outline-danger btn-sm fw-semibold">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* VISTA SEGÚN ROL */}
      {rol === "ROLE_ADMIN" ? (
        vistaAdmin === "inventario" ? (
          /* VISTA ADMIN - INVENTARIO */
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card p-3 shadow-sm border-0">
                <h5 className="fw-bold mb-3">{editando ? "Editar Lavadora" : "Agregar Lavadora"}</h5>
                <form onSubmit={handleGuardarLavadora}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Marca</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={formLavadora.marca}
                      onChange={(e) => setFormLavadora({ ...formLavadora, marca: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Modelo</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={formLavadora.modelo}
                      onChange={(e) => setFormLavadora({ ...formLavadora, modelo: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Precio ($)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      required
                      value={formLavadora.precio}
                      onChange={(e) => setFormLavadora({ ...formLavadora, precio: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Cantidad (Stock)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      required
                      value={formLavadora.cantidad}
                      onChange={(e) => setFormLavadora({ ...formLavadora, cantidad: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Capacidad (Kg)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      required
                      value={formLavadora.capacidad}
                      onChange={(e) => setFormLavadora({ ...formLavadora, capacidad: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">URL de la Imagen</label>
                    <input
                      type="url"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="form-control form-control-sm"
                      value={formLavadora.imagenUrl}
                      onChange={(e) => setFormLavadora({ ...formLavadora, imagenUrl: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-2">
                    {editando ? "Actualizar" : "Guardar"}
                  </button>
                  {editando && (
                    <button type="button" className="btn btn-secondary w-100" onClick={resetForm}>
                      Cancelar
                    </button>
                  )}
                </form>
              </div>
            </div>

            <div className="col-md-8">
              <div className="card p-3 shadow-sm border-0">
                <h5 className="fw-bold mb-3">Catálogo e Inventario (Modo Administrador)</h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Imagen</th>
                        <th>Marca</th>
                        <th>Modelo</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Capacidad</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lavadoras.map((lav) => (
                        <tr key={lav.id}>
                          <td>{lav.id}</td>
                          <td>
                            <img
                              src={lav.imagenUrl || IMAGEN_DEFECTO}
                              onError={(e) => { e.target.src = IMAGEN_DEFECTO; }}
                              alt={lav.marca}
                              style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "6px" }}
                            />
                          </td>
                          <td>{lav.marca}</td>
                          <td>{lav.modelo}</td>
                          <td>${lav.precio}</td>
                          <td>{lav.cantidad}</td>
                          <td>{lav.capacidad} Kg</td>
                          <td>
                            <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditar(lav)}>
                              ✏
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(lav.id)}>
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* VISTA ADMIN - GESTIÓN DE TODOS LOS PEDIDOS */
          <div className="card p-3 shadow-sm border-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">Gestión Global de Pedidos de Clientes 📋</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={cargarTodosLosPedidos}>
                🔄 Actualizar
              </button>
            </div>

            {todosLosPedidos.length === 0 ? (
              <div className="alert alert-info">No hay pedidos registrados en la tienda.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Tiquete</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Total</th>
                      <th>Estado Actual</th>
                      <th>Cambiar Estado</th>
                      <th>Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todosLosPedidos.map((ped) => (
                      <tr key={ped.id}>
                        <td className="fw-bold text-primary">{ped.numeroTiquete}</td>
                        <td>{ped.clienteUsername}</td>
                        <td className="small">{new Date(ped.fecha).toLocaleString()}</td>
                        <td className="fw-bold">${ped.total}</td>
                        <td>
                          <span
                            className={`badge ${
                              ped.estado === "ENTREGADO"
                                ? "bg-success"
                                : ped.estado === "ENVIADO"
                                ? "bg-info text-dark"
                                : ped.estado === "EN_PROCESO"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {ped.estado || "PENDIENTE"}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            style={{ width: "140px" }}
                            value={ped.estado || "PENDIENTE"}
                            onChange={(e) => cambiarEstadoPedido(ped.id, e.target.value)}
                          >
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="EN_PROCESO">EN PROCESO</option>
                            <option value="ENVIADO">ENVIADO</option>
                            <option value="ENTREGADO">ENTREGADO</option>
                          </select>
                        </td>
                        <td>
                          <small className="text-muted">
                            {ped.detalles
                              ? ped.detalles
                                  .map(
                                    (d) =>
                                      `${d.lavadora ? d.lavadora.marca : "Lavadora"} (x${d.cantidad})`
                                  )
                                  .join(", ")
                              : "Sin detalles"}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      ) : mostrarHistorial ? (
        /* VISTA CLIENTE - MIS PEDIDOS */
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold m-0">Historial de Mis Pedidos 📋</h5>
            <button className="btn btn-sm btn-secondary" onClick={() => setMostrarHistorial(false)}>
              ← Volver al Catálogo
            </button>
          </div>
          {misPedidos.length === 0 ? (
            <div className="alert alert-info">Aún no has realizado ninguna compra.</div>
          ) : (
            <div className="row">
              {misPedidos.map((pedido) => (
                <div className="col-md-6 mb-3" key={pedido.id}>
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <strong className="text-primary">{pedido.numeroTiquete}</strong>
                      <span className="badge bg-success">{pedido.estado || "PENDIENTE"}</span>
                    </div>
                    <div className="card-body">
                      <p className="mb-1 small">
                        <strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}
                      </p>
                      <p className="mb-2 small">
                        <strong>Total Pagado:</strong> ${pedido.total}
                      </p>
                      <h6 className="fw-bold small mt-3">Productos:</h6>
                      <ul className="list-group list-group-flush small">
                        {pedido.detalles &&
                          pedido.detalles.map((det, i) => (
                            <li key={i} className="list-group-item px-0 py-1 d-flex justify-content-between">
                              <span>
                                {det.lavadora ? `${det.lavadora.marca} ${det.lavadora.modelo}` : "Lavadora"} x{det.cantidad}
                              </span>
                              <span>${det.subtotal}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VISTA CLIENTE - CATÁLOGO CON FILTROS */
        <div className="row">
          <div className="col-md-8">
            <div className="card p-3 mb-4 shadow-sm border-0 bg-light">
              <h6 className="fw-bold mb-2">🔍 Buscar y Filtrar Lavadoras</h6>
              <form onSubmit={aplicarFiltros} className="row g-2">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Marca o modelo..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Precio máx. ($)"
                    value={filtroPrecioMax}
                    onChange={(e) => setFiltroPrecioMax(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Capacidad mín. (Kg)"
                    value={filtroCapacidadMin}
                    onChange={(e) => setFiltroCapacidadMin(e.target.value)}
                  />
                </div>
                <div className="col-md-2 d-flex gap-1">
                  <button type="submit" className="btn btn-primary btn-sm w-100 fw-semibold">
                    Buscar
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={limpiarFiltros}
                    title="Limpiar filtros"
                  >
                    🔄
                  </button>
                </div>
              </form>
            </div>

            <h5 className="fw-bold mb-3">Catálogo de Lavadoras Disponibles</h5>
            {lavadoras.length === 0 ? (
              <div className="alert alert-warning">No se encontraron lavadoras con los criterios ingresados.</div>
            ) : (
              <div className="row">
                {lavadoras.map((lav) => (
                  <div className="col-md-6 mb-3" key={lav.id}>
                    <div className="card h-100 shadow-sm border-0">
                      <img
                        src={lav.imagenUrl || IMAGEN_DEFECTO}
                        onError={(e) => { e.target.src = IMAGEN_DEFECTO; }}
                        className="card-img-top"
                        alt={`${lav.marca} ${lav.modelo}`}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <div className="card-body d-flex flex-column justify-content-between">
                        <div>
                          <h6 className="fw-bold text-dark">{lav.marca} - {lav.modelo}</h6>
                          <p className="mb-1 text-muted small">
                            <strong>Precio:</strong> ${lav.precio}
                          </p>
                          <p className="mb-1 text-muted small">
                            <strong>Capacidad:</strong> {lav.capacidad} Kg
                          </p>
                          <p className="mb-2 text-muted small">
                            <strong>Stock Disponible:</strong> {lav.cantidad}
                          </p>
                        </div>
                        <button
                          className="btn btn-primary w-100 mt-2"
                          disabled={lav.cantidad <= 0}
                          onClick={() => agregarAlCarrito(lav)}
                        >
                          {lav.cantidad > 0 ? "🛒 Agregar al Carrito" : "Agotado"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-md-4">
            <div className="card p-3 shadow-sm border-0 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold m-0">🛒 Mi Carrito</h5>
                {carrito.length > 0 && (
                  <button className="btn btn-outline-danger btn-sm py-0 px-2 fw-semibold" onClick={vaciarCarrito}>
                    🗑️ Vaciar
                  </button>
                )}
              </div>

              {carrito.length === 0 ? (
                <p className="text-muted small mb-0">El carrito está vacío.</p>
              ) : (
                <>
                  <ul className="list-group list-group-flush mb-3">
                    {carrito.map((item) => (
                      <li
                        key={item.lavadora.id}
                        className="list-group-item d-flex justify-content-between align-items-center px-0 py-2"
                      >
                        <div>
                          <span className="fw-semibold">{item.lavadora.marca}</span> x{item.cantidad}
                          <br />
                          <small className="text-muted">${item.lavadora.precio * item.cantidad}</small>
                        </div>
                        <button
                          className="btn btn-sm btn-light text-danger border-0"
                          onClick={() => eliminarDelCarrito(item.lavadora.id)}
                        >
                          ❌
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button className="btn btn-success w-100 fw-semibold" onClick={realizarCheckout}>
                    Confirmar y Pagar
                  </button>
                </>
              )}
            </div>

            {factura && (
              <div className="card p-3 bg-light border-success shadow-sm">
                <h6 className="text-success fw-bold">¡Compra Exitosa! 🎉</h6>
                <p className="mb-1 small"><strong>Tiquete:</strong> {factura.numeroTiquete}</p>
                <p className="mb-1 small"><strong>Cliente:</strong> {factura.clienteUsername}</p>
                <p className="mb-1 small"><strong>Total:</strong> ${factura.total}</p>
                <small className="text-muted" style={{ fontSize: "11px" }}>
                  {new Date(factura.fecha).toLocaleString()}
                </small>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}