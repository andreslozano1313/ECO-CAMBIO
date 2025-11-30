import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/login`;

const Login = ({ setIsAuthenticated }) => {
    const [formData, setFormData] = useState({
        email: '',
        contraseña: '',
    });

    const { email, contraseña } = formData;
    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!email || !contraseña) {
            Swal.fire('Error', 'Por favor, ingrese email y contraseña.', 'warning');
            return;
        }

        try {
            const response = await axios.post(API_URL, formData);
            
            // 1. Guardar el JWT en el localStorage (Clave del MERN Stack)
            const token = response.data.token;
            localStorage.setItem('userToken', token);
            
            // 2. Mostrar SweetAlert de éxito
            Swal.fire('Éxito', `¡Bienvenido, ${response.data.nombres}!`, 'success');
            
            // 3. Actualizar el estado de autenticación de la App
            setIsAuthenticated(true); 
            
            // 4. Redirigir al feed de publicaciones
            navigate('/'); 

        } catch (error) {
            console.error('Error de login:', error.response?.data?.message || 'Error de conexión');
            Swal.fire(
                'Error de Login',
                error.response?.data?.message || 'Credenciales inválidas o error de red.',
                'error'
            );
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                
                {/* 1. SECCIÓN DEL LOGO Y TÍTULO */}
                <div style={styles.header}>
                    {/* Reemplaza 'logo' si es necesario */}
                    <img src="/LOGO.jpeg" alt="Eco-Cambio Logo" style={styles.logo} /> 
                    <h2 style={styles.title}>Iniciar Sesión</h2>
                    <p style={styles.subtitle}>¡Únete al cambio sostenible!</p>
                </div>

                <form onSubmit={onSubmit} style={styles.form}>
                    {/* 2. CAMPO DE CORREO */}
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="Correo Electrónico"
                        required
                        style={styles.input}
                    />
                    {/* 3. CAMPO DE CONTRASEÑA */}
                    <input
                        type="password"
                        name="contraseña"
                        value={contraseña}
                        onChange={onChange}
                        placeholder="Contraseña"
                        required
                        style={styles.input}
                    />
                    
                    {/* 4. ENLACE DE RESTABLECER CONTRASEÑA */}
                    <p style={styles.forgotPassword}>
                        <Link to="/forgotpassword" style={styles.link}>¿Olvidaste tu contraseña?</Link>
                    </p>

                    {/* 5. BOTÓN PRINCIPAL */}
                    <button type="submit" style={styles.button}>
                        Entrar
                    </button>
                </form>

                {/* 6. ENLACE DE REGISTRO */}
                <div style={styles.registerPrompt}>
                    <p>¿No tienes una cuenta?</p>
                    <Link to="/register" style={styles.registerLink}>
                        Regístrate
                    </Link>
                </div>

            </div>
        </div>
    );
};

// --- Estilos Actualizados (Simulando el Diseño de la Imagen) ---
const styles = {
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5', // Fondo ligero
    },
    card: {
        width: '100%',
        maxWidth: '380px', // Ancho fijo
        padding: '40px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', // Sombra más suave
        textAlign: 'center',
    },
    header: {
        marginBottom: '30px',
    },
    logo: {
        width: '180px',
        height: '180px',
        marginBottom: '10px',
        // Estilo circular o el que desees para el logo
        borderRadius: '50%', 
        objectFit: 'cover',
    },
    title: {
        fontSize: '24px',
        color: '#333',
        margin: '0',
    },
    subtitle: {
        fontSize: '14px',
        color: '#666',
        marginTop: '5px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        marginBottom: '15px',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '16px',
    },
    button: {
        padding: '12px',
        backgroundColor: '#4CAF50', // Verde ecológico
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    forgotPassword: {
        textAlign: 'right',
        marginBottom: '20px',
        fontSize: '14px',
    },
    registerPrompt: {
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #eee',
    },
    registerLink: {
        display: 'block',
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#007bff', // Azul para resaltar el registro
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
    },
    link: {
        color: '#4CAF50', // Color para los enlaces internos
        textDecoration: 'none',
    }
};

export default Login;