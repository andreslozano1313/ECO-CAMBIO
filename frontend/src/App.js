import React, { useState, useEffect, useCallback } from 'react'; // <-- Asegúrate de tener useCallback
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'; 
import axios from 'axios'; // <-- NUEVO: Para consulta de notificaciones
import Swal from 'sweetalert2';

// --- Importaciones de Componentes ---
import Login from './components/Login';
import Register from './components/Register'; 
import ReporteForm from './components/ReporteForm';
import CrearProductoForm from './components/CrearProductoForm'; 
import MarketplaceList from './components/MarketplaceList';
import ForgotPassword from './components/ForgotPassword';
import ProductoDetalle from './components/ProductoDetalle';
import ReporteMapa from './components/ReporteMapa';
import BandejaMensajes from './components/BandejaMensajes'; // <-- NUEVO COMPONENTE

const NOTIFICACIONES_API_URL = 'http://localhost:5000/api/notificaciones'; // <-- URL de Notificaciones

// Componente que comprueba si hay un token en localStorage
const checkAuth = () => {
    return !!localStorage.getItem('userToken');
};

const PrivateRoute = ({ children }) => {
    const isAuthenticated = checkAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};


function App() {
    // ESTADO
    const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());
    const [notifCount, setNotifCount] = useState(0); // <-- NUEVO ESTADO PARA NOTIFICACIONES

    // FUNCIÓN PARA BUSCAR NOTIFICACIONES PENDIENTES
    const fetchNotificaciones = useCallback(async () => {
        const REAL_TOKEN = localStorage.getItem('userToken');
        if (!REAL_TOKEN) return;
        try {
            const config = { headers: { Authorization: `Bearer ${REAL_TOKEN}` } };
            const response = await axios.get(NOTIFICACIONES_API_URL, config); 
            setNotifCount(response.data.length);
        } catch (error) {
            console.error("Fallo al cargar notificaciones:", error);
            setNotifCount(0);
        }
    }, []);

    useEffect(() => {
        setIsAuthenticated(checkAuth());
        
        // Lógica de Notificaciones al iniciar sesión
        if (checkAuth()) {
            fetchNotificaciones();
            // Consulta periódica (cada 30 segundos)
            const interval = setInterval(fetchNotificaciones, 30000); 
            return () => clearInterval(interval); // Limpiar al desmontar
        }
    }, [fetchNotificaciones]); // Dependencia del useCallback

    // Función para manejar el logout
    const handleLogout = () => {
        localStorage.removeItem('userToken');
        setIsAuthenticated(false);
        Swal.fire('Sesión Cerrada', 'Has cerrado tu sesión con éxito.', 'info');
    };

    // --- Componente de Barra de Navegación (Navbar) ---
    const Navbar = () => (
        <nav style={styles.navbar}>
            {isAuthenticated && (
                <>
                    <Link to="/" style={styles.navLink}>Marketplace</Link>
                    <Link to="/crear-producto" style={styles.navLink}>Publicar Artículo</Link>
                    <Link to="/reporte-form" style={styles.navLink}>Enviar Reporte</Link> {/* <-- Cambié /reporte por /reporte-form */}
                    <Link to="/mapa-incidentes" style={styles.navLink}>Mapa Incidentes 🌍</Link>
                    
                    {/* ENLACE A LA BANDEJA DE MENSAJES Y ALERTA VISUAL */}
                    <Link to="/bandeja-mensajes" style={styles.navLink}>
                        Mensajes 
                        {notifCount > 0 && <span style={styles.notifBadge}>{notifCount}</span>} {/* <-- INDICADOR DE NOTIFICACIONES */}
                    </Link>
                </>
            )}
            
            <div style={{ marginLeft: 'auto' }}>
                {isAuthenticated ? (
                    <button onClick={handleLogout} style={styles.logoutButton}>Cerrar Sesión</button>
                ) : (
                    <></> 
                )}
            </div>
        </nav>
    );
    // --- Fin Navbar ---


    return (
        <Router>
            <Navbar /> 

            <Routes>
                {/* Rutas Públicas */}
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/register" element={<Register />} /> 
                <Route path="/forgotpassword" element={<ForgotPassword />} />

                {/* Rutas Protegidas (Requieren JWT) */}
                <Route path="/reporte-form" element={<PrivateRoute><ReporteForm /></PrivateRoute>} />
                <Route path="/crear-producto" element={<PrivateRoute><CrearProductoForm /></PrivateRoute>} />
                <Route path="/" element={<PrivateRoute><MarketplaceList /></PrivateRoute>} />
                <Route path="/productos/:id" element={<PrivateRoute><ProductoDetalle /></PrivateRoute>} />
                
                {/* RUTA DE BANDEJA DE MENSAJES */}
                <Route path="/bandeja-mensajes" element={<PrivateRoute><BandejaMensajes /></PrivateRoute>} /> {/* <-- NUEVA RUTA */}

                {/* RUTA DE VISIBILIDAD DE MAPA */}
                <Route path="/mapa-incidentes" element={<PrivateRoute><ReporteMapa /></PrivateRoute>} />

                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

// Estilos de la Navbar (Mantener los estilos que enviaste)
const styles = {
    // 1. Fondo de la barra: Cambiado a transparente o blanco
    navbar: { 
        display: 'flex', 
        padding: '15px 20px', 
        backgroundColor: 'transparent', // Fondo transparente (o 'white' si lo prefieres)
        color: 'black', // Color del texto (si hay)
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', // Sombra ligera para separación
    },
    // 2. Color del texto: Cambiado a negro para contraste con fondo claro
    navLink: { 
        color: 'black', 
        textDecoration: 'none', 
        margin: '0 10px',
        fontWeight: 'bold',
    },
    logoutButton: { padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default App;



