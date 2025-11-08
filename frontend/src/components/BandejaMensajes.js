import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const API_MENSAJES_URL = 'http://localhost:5000/api/mensajes';
const API_RECIBIDOS_URL = `${API_MENSAJES_URL}/recibidos`; 
const API_PRODUCTOS_URL = 'http://localhost:5000/api/productos'; // URL para la eliminación

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

    // 1. FUNCIÓN PARA RETIRAR EL PRODUCTO (DELETE)
    const handleRetirarProducto = async (productoId, nombre) => {
        const result = await Swal.fire({
            title: '¿Confirmar Transacción y Retiro?',
            text: `¿Estás seguro de que la transacción de "${nombre}" se ha completado? Esto eliminará permanentemente el artículo del Marketplace.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745', // Verde de éxito
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, Completado y Retirar',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_PRODUCTOS_URL}/${productoId}`, getConfig()); 

                Swal.fire(
                    '¡Transacción Exitosa!',
                    `El artículo "${nombre}" ha sido retirado del Marketplace.`,
                    'success'
                );
                
                fetchMensajes(); 

            } catch (error) {
                console.error("Error al retirar producto:", error);
                const errorMessage = error.response?.data?.message || 'Fallo al retirar. Solo el publicador puede hacerlo.';
                Swal.fire(
                    'Error',
                    errorMessage,
                    'error'
                );
            }
        }
    };


    // 2. FUNCIÓN PARA RESPONDER AL MENSAJE (Utiliza la API de Mensajes)
    const handleReply = (mensaje) => {
        Swal.fire({
            title: `Responder a ${mensaje.emisor.nombres}`,
            html: `
                <p style="text-align: left; margin-bottom: 10px;">Respondiendo sobre: <strong>${mensaje.producto?.Nombre_Producto || 'Artículo Retirado'}</strong>.</p>
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
                        // El campo producto.id es seguro porque ya verificamos que exista antes de llamar a handleReply
                        productoId: mensaje.producto._id, 
                        contenido: result.value,
                        receptorId: mensaje.emisor._id, 
                        tipoMensaje: 'RESPUESTA_VENDEDOR' 
                    };
                    
                    await axios.post(API_MENSAJES_URL, data, getConfig());

                    Swal.fire('Respuesta Enviada', `Has enviado tu respuesta a ${mensaje.emisor.nombres}.`, 'success');
                    fetchMensajes(); 

                } catch (error) {
                    Swal.fire('Error', error.response?.data?.message || 'Fallo al enviar la respuesta.', 'error');
                }
            }
        });
    };


    if (loading) return <div style={styles.container}>Cargando bandeja...</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Bandeja de Intereses Recibidos ({mensajes.length})</h2>
            <p style={styles.subtitle}>Mensajes de usuarios interesados en tus publicaciones.</p>

            {mensajes.length === 0 ? (
                <p style={styles.empty}>No tienes mensajes de interés pendientes.</p>
            ) : (
                <div style={styles.grid}>
                    {mensajes.map(mensaje => {
                        
                        // --- SOLUCIÓN AL ERROR DE NULL ---
                        // Si el producto está eliminado (null), mostramos una tarjeta alternativa.
                        if (!mensaje.producto) {
                             return (
                                <div key={mensaje._id} style={{...styles.card, borderLeft: '5px solid #dc3545'}}>
                                    <p style={styles.messageType}>⚠️ Mensaje de Artículo Retirado</p>
                                    <p><strong>De:</strong> {mensaje.emisor.nombres}</p>
                                    <div style={styles.contentBox}>
                                        El artículo original ha sido eliminado del Marketplace.
                                    </div>
                                </div>
                            );
                        }

                        // --- RENDERIZADO NORMAL (Si el producto existe) ---
                        return (
                            <div key={mensaje._id} style={styles.card}>
                                <p style={styles.messageType}>
                                    {mensaje.tipoMensaje.includes('COMPRA') ? '🛒 Interés de COMPRA' : 
                                     mensaje.tipoMensaje.includes('DONACION') ? '🎁 Interés de DONACIÓN' : '↩️ Respuesta'}
                                </p>
                                {/* Utilizamos el encadenamiento opcional (?) para mayor seguridad, aunque el check de null ya lo cubre */}
                                <h3 style={styles.productTitle}>Artículo: {mensaje.producto?.Nombre_Producto}</h3> 
                                <p><strong>De:</strong> {mensaje.emisor.nombres}</p>
                                <div style={styles.contentBox}>
                                    <strong>Mensaje:</strong> {mensaje.contenido}
                                </div>
                                <p style={styles.date}>{new Date(mensaje.createdAt).toLocaleString()}</p>
                                
                                {/* BOTÓN DE RETIRAR PRODUCTO */}
                                <button 
                                    style={styles.retirarButton} 
                                    onClick={() => handleRetirarProducto(mensaje.producto._id, mensaje.producto.Nombre_Producto)}
                                >
                                    ✅ Transacción Cerrada y Retirar Artículo
                                </button>

                                {/* BOTÓN DE RESPUESTA */}
                                <button 
                                    style={styles.replyButton} 
                                    onClick={() => handleReply(mensaje)}
                                >
                                    Coordinar / Responder
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Estilos básicos (Añadiendo estilos para los botones de acción)
const styles = {
    container: { maxWidth: '1000px', margin: '40px auto', padding: '0 20px' },
    title: { textAlign: 'center', color: '#333', marginBottom: '5px' },
    subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
    card: { padding: '20px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', backgroundColor: 'white', display: 'flex', flexDirection: 'column', },
    productTitle: { fontSize: '1.2em', margin: '0 0 10px 0', color: '#007bff' },
    messageType: { fontWeight: 'bold', color: '#4CAF50' },
    contentBox: { padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px', marginTop: '10px', marginBottom: '15px', borderLeft: '3px solid #007bff', flexGrow: 1 },
    date: { fontSize: '0.8em', color: '#999' },
    empty: { textAlign: 'center', color: '#999', padding: '50px' },
    
    // --- ESTILOS DE BOTONES DE ACCIÓN ---
    retirarButton: { // Botón Verde (Retirar)
        padding: '8px 15px', 
        backgroundColor: '#4CAF50', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        marginTop: '15px', 
        marginBottom: '5px',
        fontWeight: 'bold',
        width: '100%',
    },
    replyButton: { // Botón Amarillo/Naranja (Responder)
        padding: '8px 15px', 
        backgroundColor: '#ffc107', 
        color: 'black', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        marginTop: '5px',
        width: '100%',
    }
};

export default BandejaMensajes;