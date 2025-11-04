import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'; // <-- Asegúrate de importar Link
import Login from './components/Login';
import Register from './components/Register'; 
import ReporteForm from './components/ReporteForm';
import CrearProductoForm from './components/CrearProductoForm'; 
import MarketplaceList from './components/MarketplaceList';
import Swal from 'sweetalert2';
import ForgotPassword from './components/ForgotPassword';
import ProductoDetalle from './components/ProductoDetalle';
import ReporteMapa from './components/ReporteMapa';

// Componente que comprueba si hay un token en localStorage
const checkAuth = () => {
    return !!localStorage.getItem('userToken');
};

const PrivateRoute = ({ children }) => {
    const isAuthenticated = checkAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};


function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());

    useEffect(() => {
        setIsAuthenticated(checkAuth());
    }, []);
    
    const handleLogout = () => {
        localStorage.removeItem('userToken');
        setIsAuthenticated(false);
        Swal.fire('Sesión Cerrada', 'Has cerrado tu sesión con éxito.', 'info');
    };

    // --- Componente de Barra de Navegación (Navbar) CORREGIDO ---
    const Navbar = () => (
        <nav style={styles.navbar}>
            {isAuthenticated && (
                <>
                    
                    <Link to="/" style={styles.navLink}>Marketplace</Link>
                    <Link to="/crear-producto" style={styles.navLink}>Publicar Artículo</Link>
                    <Link to="/reporte" style={styles.navLink}>Reporte Ciudadano</Link>


                    {/* ENLACE A LA VISTA PÚBLICA DEL MAPA */}
                    <Link to="/mapa-incidentes" style={styles.navLink}>Mapa Incidentes 🌍</Link>
                </>
            )}
            
            <div style={{ marginLeft: 'auto' }}>
                {isAuthenticated ? (
                    <button onClick={handleLogout} style={styles.logoutButton}>Cerrar Sesión</button>
                ) : (
                    // SECCIÓN MODIFICADA: Ahora solo contendrá el espacio vacío
                    <></> 
                )}
            </div>
        </nav>
    );
    // --- Fin Navbar ---


    return (
        <Router>
            {/* INCLUIR LA BARRA DE NAVEGACIÓN AQUÍ */}
            <Navbar /> 

            <Routes>
                {/* Rutas Públicas */}
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/register" element={<Register />} /> 
                <Route path="/forgotpassword" element={<ForgotPassword />} />

                {/* Rutas Protegidas (Requieren JWT) */}
                
                <Route path="/reporte" element={<PrivateRoute><ReporteForm /></PrivateRoute>} />
                <Route path="/crear-producto" element={<PrivateRoute><CrearProductoForm /></PrivateRoute>} />
                <Route path="/" element={<PrivateRoute><MarketplaceList /></PrivateRoute>} />
                <Route path="/productos/:id" element={<PrivateRoute><ProductoDetalle /></PrivateRoute>} />

                {/* Redirección por defecto */}
                <Route path="*" element={<Navigate to="/" />} />

                <Route path="/reporte-form" element={<PrivateRoute><ReporteForm /></PrivateRoute>} />
                <Route path="/mapa-incidentes" element={<PrivateRoute><ReporteMapa /></PrivateRoute>} />
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



