import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/usuarios/perfil';

const ActualizarPerfil = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombres: '',
        email: '',
        contraseña: '', // Campo opcional para cambio de contraseña
    });
    const [loading, setLoading] = useState(true);
    const REAL_TOKEN = localStorage.getItem('userToken');

    // 1. Cargar datos actuales del perfil (GET /api/usuarios/perfil)
    useEffect(() => {
        const fetchPerfil = async () => {
            if (!REAL_TOKEN) { navigate('/login'); return; }
            try {
                const config = { headers: { Authorization: `Bearer ${REAL_TOKEN}` } };
                const response = await axios.get(API_URL, config);
                setFormData({
                    nombres: response.data.nombres,
                    email: response.data.email,
                    contraseña: '', // La contraseña siempre se deja vacía al cargar
                });
                setLoading(false);
            } catch (error) {
                Swal.fire('Error', 'No se pudo cargar su perfil.', 'error');
                setLoading(false);
            }
        };
        fetchPerfil();
    }, [REAL_TOKEN, navigate]);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 2. Enviar actualización (PUT /api/usuarios/perfil)
    const onSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const config = { headers: { Authorization: `Bearer ${REAL_TOKEN}` } };
            const payload = {
                nombres: formData.nombres,
                email: formData.email,
                contraseña: formData.contraseña.length > 0 ? formData.contraseña : undefined // Solo enviar si se ingresó algo
            };

            const response = await axios.put(API_URL, payload, config);
            
            Swal.fire('Éxito', response.data.message, 'success');
            navigate('/'); // Redirigir al Marketplace

        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Fallo al actualizar.', 'error');
        }
    };

    if (loading) return <div style={styles.container}>Cargando perfil...</div>;

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h2 style={styles.title}>Actualizar Datos de Perfil</h2>
                <form onSubmit={onSubmit} style={styles.form}>
                    <label style={styles.label}>Nombres Completos</label>
                    <input type="text" name="nombres" value={formData.nombres} onChange={onChange} required style={styles.input} />
                    
                    <label style={styles.label}>Correo Electrónico</label>
                    <input type="email" name="email" value={formData.email} onChange={onChange} required style={styles.input} />
                    
                    <label style={styles.label}>Nueva Contraseña (Dejar vacío para no cambiar)</label>
                    <input type="password" name="contraseña" value={formData.contraseña} onChange={onChange} placeholder="••••••••" style={styles.input} />
                    
                    <button type="submit" style={styles.button}>
                        Guardar Cambios
                    </button>
                </form>
            </div>
        </div>
    );
};

// Estilos reutilizados
const styles = {
    pageContainer: { /* ... estilos de centrado ... */ },
    card: { width: '100%', maxWidth: '450px', padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' },
    title: { textAlign: 'center', fontSize: '24px', color: '#333', marginBottom: '30px' },
    form: { display: 'flex', flexDirection: 'column' },
    label: { textAlign: 'left', marginBottom: '5px', fontSize: '15px', fontWeight: 'bold' },
    input: { marginBottom: '20px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' },
    button: { padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    // ... (Asegúrate de copiar los estilos básicos de pageContainer de tus otros formularios)
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
    },
};

export default ActualizarPerfil;