import React, { useState, useEffect, useCallback } from 'react'; // Aseguramos useCallback
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const API_MENSAJES_URL = 'http://localhost:5000/api/mensajes'; // URL base para enviar mensajes
const API_RECIBIDOS_URL = `${API_MENSAJES_URL}/recibidos`; // URL para recibir mensajes

const BandejaMensajes = () => {
    const [mensajes, setMensajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const REAL_TOKEN = localStorage.getItem('userToken');

    // Función para obtener la configuración de Headers
    const getConfig = useCallback(() => ({
        headers: { Authorization: `Bearer ${REAL_TOKEN}` }
    }), [REAL_TOKEN]);

    const fetchMensajes = useCallback(async () => {
        if (!REAL_TOKEN) { navigate('/login'); return; }
        try {
            const response = await axios.get(API_RECIBIDOS_URL, getConfig());
            setMensajes(response.data);
            setLoading(false);
        } catch (error) {
            Swal.fire('Error', 'No se pudo cargar la bandeja de mensajes.', 'error');
            setLoading(false);
        }
    }, [REAL_TOKEN, navigate, getConfig]);

    useEffect(() => {
        fetchMensajes();
    }, [fetchMensajes]);


    // 1. FUNCIÓN PARA RESPONDER AL MENSAJE
    const handleReply = (mensaje) => {
        Swal.fire({
            title: `Responder a ${mensaje.emisor.nombres}`,
            html: `
                <p style="text-align: left; margin-bottom: 10px;">Respondiendo sobre: <strong>${mensaje.producto.Nombre_Producto}</strong>.</p>
                <textarea id="swal-reply-message" placeholder="Escribe tu respuesta de coordinación..." 
                maxlength="300" style="width: 100%; height: 120px; padding: 10px; resize: vertical; border-radius: 6px;"></textarea>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Enviar Respuesta',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const reply = document.getElementById('swal-reply-message').value;
                if (!reply.trim()) {
                    Swal.showValidationMessage('El mensaje no puede estar vacío.');
                }
                return reply;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const data = {
                        productoId: mensaje.producto._id,
                        contenido: result.value,
                        receptorId: mensaje.emisor._id, // El receptor del nuevo mensaje es el emisor del mensaje original
                        tipoMensaje: 'RESPUESTA_VENDEDOR' 
                    };
                    
                    // Llama a la API POST /api/mensajes
                    await axios.post(API_MENSAJES_URL, data, getConfig());

                    Swal.fire('Respuesta Enviada', `Has enviado tu respuesta a ${mensaje.emisor.nombres}.`, 'success');
                    fetchMensajes(); // Recargar la bandeja para actualizar

                } catch (error) {
                    Swal.fire('Error', error.response?.data?.message || 'Fallo al enviar la respuesta.', 'error');
                }
            }
        });
    };
    // ----------------------------------------------------


    if (loading) return <div style={styles.container}>Cargando bandeja...</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Bandeja de Intereses Recibidos ({mensajes.length})</h2>
            <p style={styles.subtitle}>Mensajes de usuarios interesados en tus publicaciones.</p>

            {mensajes.length === 0 ? (
                <p style={styles.empty}>No tienes mensajes de interés pendientes.</p>
            ) : (
                <div style={styles.grid}>
                    {mensajes.map(mensaje => (
                        <div key={mensaje._id} style={styles.card}>
                            <p style={styles.messageType}>
                                {mensaje.tipoMensaje.includes('COMPRA') ? '🛒 Interés de COMPRA' : 
                                 mensaje.tipoMensaje.includes('DONACION') ? '🎁 Interés de DONACIÓN' : '↩️ Respuesta'}
                            </p>
                            <h3 style={styles.productTitle}>Artículo: {mensaje.producto.Nombre_Producto}</h3>
                            <p><strong>De:</strong> {mensaje.emisor.nombres}</p>
                            <div style={styles.contentBox}>
                                <strong>Mensaje:</strong> {mensaje.contenido}
                            </div>
                            <p style={styles.date}>{new Date(mensaje.createdAt).toLocaleString()}</p>
                            
                            {/* 2. BOTÓN QUE LLAMA A LA FUNCIÓN DE RESPUESTA */}
                            <button 
                                style={styles.replyButton} 
                                onClick={() => handleReply(mensaje)}
                            >
                                Coordinar / Responder
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Estilos básicos
const styles = {
    container: { maxWidth: '1000px', margin: '40px auto', padding: '0 20px' },
    title: { textAlign: 'center', color: '#333', marginBottom: '5px' },
    subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
    card: { padding: '20px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', backgroundColor: 'white' },
    productTitle: { fontSize: '1.2em', margin: '0 0 10px 0', color: '#007bff' },
    messageType: { fontWeight: 'bold', color: '#4CAF50' },
    contentBox: { padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px', marginTop: '10px', marginBottom: '15px', borderLeft: '3px solid #007bff' },
    date: { fontSize: '0.8em', color: '#999' },
    empty: { textAlign: 'center', color: '#999', padding: '50px' },
    replyButton: { padding: '8px 15px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }
};

export default BandejaMensajes;