import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/auth/forgotpassword`;

const ForgotPassword = () => {
    const [email, setEmail] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(API_URL, { email });

            Swal.fire(
                '¡Correo Enviado!', 
                'Si la dirección está registrada, recibirás un enlace de restablecimiento.', 
                'success'
            );
            
        } catch (error) {
            console.error('Error al solicitar restablecimiento:', error);
            
            // Usando el manejo de error corregido para mostrar el mensaje del backend
            const errorMessage = error.response?.data?.message || 'Error de conexión desconocido.';
            
            Swal.fire(
                'Error de Servidor', 
                errorMessage,
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
                    <h2 style={styles.title}>Restablecer Contraseña</h2>
                    <p style={styles.subtitle}>Ingresa tu email para recibir el enlace de recuperación.</p>
                </div>

                <form onSubmit={onSubmit} style={styles.form}>
                    {/* 2. CAMPO DE CORREO */}
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo Electrónico Registrado"
                        required
                        style={styles.input}
                    />
                    
                    {/* 3. BOTÓN PRINCIPAL */}
                    <button type="submit" style={styles.button}>
                        Enviar Enlace
                    </button>
                </form>

                {/* 4. ENLACE DE VOLVER AL LOGIN */}
                <div style={styles.registerPrompt}>
                    <p>¿Recordaste tu contraseña?</p>
                    <Link to="/login" style={styles.loginLink}>
                        Volver al Login
                    </Link>
                </div>

            </div>
        </div>
    );
};

// --- Estilos Actualizados 
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
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', // Sombra suave
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
        backgroundColor: '#4CAF50', // Verde ecológico 
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
        backgroundColor: '#007bff', // Color para el enlace secundario
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

export default ForgotPassword;