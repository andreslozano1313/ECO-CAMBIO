import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaEdit, FaSignOutAlt } from 'react-icons/fa'; // Iconos de React Icons

const UserDropdown = ({ handleLogout, userName }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={styles.dropdownContainer}>
            {/* Ícono de Perfil (Botón) */}
            <div 
                style={styles.profileButton} 
                onClick={() => setIsOpen(!isOpen)}
                title={`Menú de ${userName}`}
            >
                <FaUserCircle size={30} style={styles.icon}/>
            </div>

            {/* Menú Desplegable */}
            {isOpen && (
                <div style={styles.dropdownMenu}>
                    <p style={styles.userNameText}>Hola, {userName || 'Usuario'}</p>
                    
                    {/* Link: Actualizar Datos */}
                    <Link 
                        to="/perfil" 
                        style={styles.dropdownItem}
                        onClick={() => setIsOpen(false)} // Cerrar al hacer clic
                    >
                        <FaEdit style={{marginRight: '8px', color: '#337ab7'}} /> Actualizar Datos
                    </Link>
                    
                    {/* Link: Cerrar Sesión */}
                    <div 
                        onClick={() => { setIsOpen(false); handleLogout(); }} 
                        style={styles.dropdownItemLogout}
                    >
                        <FaSignOutAlt style={{marginRight: '8px'}} /> Cerrar Sesión
                    </div>
                </div>
            )}
        </div>
    );
};

// Estilos para el Dropdown
const styles = {
    dropdownContainer: {
        position: 'relative',
        display: 'inline-block',
        zIndex: 1000,
        marginLeft: '15px' // Añadir margen para separarlo de los otros links
    },
    profileButton: {
        cursor: 'pointer',
        padding: '5px',
        backgroundColor: 'transparent',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        color: 'white', 
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        right: '0',
        marginTop: '10px',
        width: '220px',
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        borderRadius: '8px',
        overflow: 'hidden',
        textAlign: 'left',
        transition: 'opacity 0.2s ease-in-out',
    },
    userNameText: {
        padding: '10px 15px',
        fontWeight: 'bold',
        borderBottom: '1px solid #eee',
        color: '#333',
        margin: 0,
        backgroundColor: '#f8f8f8',
        fontSize: '0.95em',
    },
    dropdownItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 15px',
        textDecoration: 'none',
        color: '#555',
        fontSize: '15px',
        cursor: 'pointer',
    },
    dropdownItemLogout: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 15px',
        textDecoration: 'none',
        color: '#dc3545',
        fontSize: '15px',
        cursor: 'pointer',
        borderTop: '1px solid #eee',
    },
};

export default UserDropdown;