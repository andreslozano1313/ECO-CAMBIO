import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/auth/register`;

const Register = () => {
    const [formData, setFormData] = useState({
        nombres: '',
        email: '',
        contraseña: '',
    });

    const { nombres, email, contraseña } = formData;
    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (contraseña.length < 6) {
            Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres.', 'warning');
            return;
        }

        try {
            const response = await axios.post(API_URL, formData);
            
            // Si el registro es exitoso, guarda el token y notifica
            localStorage.setItem('userToken', response.data.token);
            
            Swal.fire('¡Registro Exitoso!', 'Tu cuenta ha sido creada. ¡Bienvenido a Eco-Cambio!', 'success');
            
            // Redirigir al feed de publicaciones
            navigate('/'); 

        } catch (error) {
            console.error('Error de registro:', error.response?.data?.message || 'Error de red.');
            Swal.fire(
                'Error de Registro',
                error.response?.data?.message || 'El email ya está en uso o hay un error de red.',
                'error'
            );
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                
                {/* 1. SECCIÓN DEL LOGO Y TÍTULO */}
                <div style={styles.header}>
                    <img src="/LOGO.jpeg" alt="Eco-Cambio Logo" style={styles.logo} />  
                    <h2 style={styles.title}>Regístrate</h2>
                    <p style={styles.subtitle}>Crea tu cuenta y comienza tu impacto ambiental positivo.</p>
                </div>

                <form onSubmit={onSubmit} style={styles.form}>
                    {/* CAMPO DE NOMBRES */}
                    <input
                        type="text"
                        name="nombres"
                        value={nombres}
                        onChange={onChange}
                        placeholder="Nombres Completos"
                        required
                        style={styles.input}
                    />
                    {/* CAMPO DE CORREO */}
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="Correo Electrónico"
                        required
                        style={styles.input}
                    />
                    {/* CAMPO DE CONTRASEÑA */}
                    <input
                        type="password"
                        name="contraseña"
                        value={contraseña}
                        onChange={onChange}
                        placeholder="Contraseña (mínimo 6 caracteres)"
                        required
                        style={styles.input}
                    />
                    
                    {/* BOTÓN PRINCIPAL */}
                    <button type="submit" style={styles.button}>
                        Crear Cuenta
                    </button>
                </form>

                {/* ENLACE DE LOGIN */}
                <div style={styles.registerPrompt}>
                    <p>¿Ya tienes una cuenta?</p>
                    <Link to="/login" style={styles.loginLink}>
                        Inicia Sesión
                    </Link>
                </div>

            </div>
        </div>
    );
};

// --- Estilos Actualizados (Simulando el Diseño Consistente) ---
const styles = {
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5', 
    },
    card: {
        width: '100%',
        maxWidth: '380px', 
        padding: '40px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', 
        textAlign: 'center',
    },
    header: {
        marginBottom: '30px',
    },
    logo: {
        width: '180px',
        height: '180px',
        marginBottom: '10px',
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
        backgroundColor: '#007bff', // Azul para el botón de registro
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    registerPrompt: {
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #eee',
    },
    loginLink: {
        display: 'block',
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#4CAF50', // Verde para enlazar al Login
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
    },
    link: {
        color: '#4CAF50', 
        textDecoration: 'none',
    }
};

export default Register;