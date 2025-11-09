import React, { useState, useEffect, useCallback } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'; 
import axios from 'axios';
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
import BandejaMensajes from './components/BandejaMensajes'; 
import UserDropdown from './components/UserDropdown'; 
import ActualizarPerfil from './components/ActualizarPerfil'; 

const NOTIFICACIONES_API_URL = 'http://localhost:5000/api/notificaciones'; 

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
    const [notifCount, setNotifCount] = useState(0); 

    // Helper para obtener el nombre de usuario del token (simplificado)
    const getUserNameFromToken = () => {
        const token = localStorage.getItem('userToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.nombres || 'Usuario'; 
            } catch (e) {
                return 'Usuario';
            }
        }
        return 'Usuario';
    };


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
    }, [fetchNotificaciones]); 

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
                    {/* Links de navegación */}
                    <Link to="/" className="nav-link-item">Marketplace</Link>
                    <Link to="/crear-producto" className="nav-link-item">Publicar Artículo</Link>
                    <Link to="/reporte-form" className="nav-link-item">Enviar Reporte</Link> 
                    <Link to="/mapa-incidentes" className="nav-link-item">Mapa Incidentes 🌍</Link>
                    
                    {/* ENLACE A LA BANDEJA DE MENSAJES Y ALERTA VISUAL */}
                    <Link to="/bandeja-mensajes" className="nav-link-item">
                        Mensajes 
                        {notifCount > 0 && <span style={styles.notifBadge}>{notifCount}</span>}
                    </Link>
                </>
            )}
            
            <div style={{ marginLeft: 'auto' }}>
                {isAuthenticated ? (
                    <UserDropdown 
                        handleLogout={handleLogout} 
                        userName={getUserNameFromToken()} 
                    />
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

            {/* INYECTAR ESTILOS GLOBALES PARA EL HOVER */}
            <style dangerouslySetInnerHTML={{__html: `
                .nav-link-item { 
                    color: white; 
                    text-decoration: none; 
                    margin: 0 15px; 
                    font-weight: bold;
                    font-size: 1em;
                    transition: color 0.2s, transform 0.1s;
                    display: flex;
                    align-items: center;
                }
                .nav-link-item:hover { 
                    color: #FFC107; /* Amarillo de acción */
                    transform: scale(1.05);
                }
            `}} />

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
                <Route path="/bandeja-mensajes" element={<PrivateRoute><BandejaMensajes /></PrivateRoute>} />
                <Route path="/mapa-incidentes" element={<PrivateRoute><ReporteMapa /></PrivateRoute>} />
                
                {/* RUTA DE PERFIL / ACTUALIZACIÓN */}
                <Route path="/perfil" element={<PrivateRoute><ActualizarPerfil /></PrivateRoute>} /> 

                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

// Estilos de la Navbar (Estilos para la consistencia visual y hover)
const styles = {
    navbar: { 
        display: 'flex', 
        padding: '15px 20px', 
        backgroundColor: '#4CAF50', // FONDO VERDE OSCURO CONSISTENTE
        color: 'white', 
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)', // Sombra para elevación
    },
    navLink: { 
        color: 'white', 
        textDecoration: 'none', 
        margin: '0 15px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
    },
    notifBadge: { // ESTILO PARA EL INDICADOR DE NOTIFICACIÓN
        backgroundColor: '#FFC107', // Amarillo vibrante
        color: '#333',
        borderRadius: '50%',
        padding: '2px 7px',
        fontSize: '0.8em',
        marginLeft: '5px',
        fontWeight: 'bold'
    },
    logoutButton: { padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' },
};

export default App;









