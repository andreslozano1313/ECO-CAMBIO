import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const API_MENSAJES_URL = `${API_BASE_URL}/mensajes`;
const API_RECIBIDOS_URL = `${API_MENSAJES_URL}/recibidos`;
const API_PRODUCTOS_URL = `${API_BASE_URL}/productos`;

const BandejaMensajes = () => {
    const [mensajes, setMensajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const REAL_TOKEN = localStorage.getItem('userToken');
    const userId = localStorage.getItem('userId'); // ✅ Identificador del usuario autenticado

    // Headers de autorización
    const getConfig = useCallback(() => ({
        headers: { Authorization: `Bearer ${REAL_TOKEN}` }
    }), [REAL_TOKEN]);

    // Cargar los mensajes recibidos
    const fetchMensajes = useCallback(async () => {
        if (!REAL_TOKEN) { navigate('/login'); return; }
        try {
            const response = await axios.get(API_RECIBIDOS_URL, getConfig());
            setMensajes(response.data);
        } catch (error) {
            Swal.fire('Error', 'No se pudo cargar la bandeja de mensajes.', 'error');
        } finally {
            setLoading(false);
        }
    }, [REAL_TOKEN, navigate, getConfig]);

    useEffect(() => {
        fetchMensajes();
    }, [fetchMensajes]);

    // ✅ FUNCIÓN PARA RETIRAR PRODUCTO (solo el vendedor puede hacerlo)
    const handleRetirarProducto = async (productoId, nombre) => {
        const result = await Swal.fire({
            title: '¿Confirmar Transacción y Retiro?',
            text: `¿Estás seguro de que la transacción de "${nombre}" se ha completado? Esto eliminará el artículo del Marketplace.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, Completado y Retirar',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_PRODUCTOS_URL}/${productoId}`, getConfig());
                Swal.fire('¡Transacción Exitosa!', `El artículo "${nombre}" ha sido retirado.`, 'success');
                fetchMensajes();
            } catch (error) {
                Swal.fire(
                    'Error',
                    error.response?.data?.message || 'Solo el publicador puede retirar el artículo.',
                    'error'
                );
            }
        }
    };

    // ✅ FUNCIÓN PARA RESPONDER AL MENSAJE
    const handleReply = (mensaje) => {
        // Determinar quién es el receptor (si soy vendedor, el receptor es el comprador, y viceversa)
        const receptorId = (mensaje.emisor._id === userId)
            ? mensaje.receptor._id  // si yo soy el emisor, respondo al receptor
            : mensaje.emisor._id;   // si yo soy el receptor, respondo al emisor

        Swal.fire({
            title: 'Coordinar / Responder',
            html: `
                <p style="text-align: left; margin-bottom: 10px;">
                    Sobre: <strong>${mensaje.producto?.Nombre_Producto || 'Artículo Retirado'}</strong>
                </p>
                <textarea id="swal-reply-message" placeholder="Escribe tu mensaje..." 
                maxlength="300" style="width: 100%; height: 120px; padding: 10px; resize: vertical; border-radius: 6px;"></textarea>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const reply = document.getElementById('swal-reply-message').value.trim();
                if (!reply) Swal.showValidationMessage('El mensaje no puede estar vacío.');
                return reply;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const data = {
                        productoId: mensaje.producto?._id,
                        contenido: result.value,
                        receptorId: receptorId,
                        tipoMensaje: 'COORDINACION'
                    };
                    await axios.post(API_MENSAJES_URL, data, getConfig());
                    Swal.fire('Enviado', 'Tu mensaje fue enviado correctamente.', 'success');
                    fetchMensajes();
                } catch (error) {
                    Swal.fire('Error', error.response?.data?.message || 'No se pudo enviar el mensaje.', 'error');
                }
            }
        });
    };

    if (loading) return <div style={styles.container}>Cargando bandeja...</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Bandeja de Mensajes ({mensajes.length})</h2>
            <p style={styles.subtitle}>Mensajes de coordinación entre comprador y vendedor.</p>

            {mensajes.length === 0 ? (
                <p style={styles.empty}>No tienes mensajes pendientes.</p>
            ) : (
                <div style={styles.grid}>
                    {mensajes.map(mensaje => {
                        const esVendedor = mensaje.producto?.publicador?._id === userId; // ✅ Detectar si el usuario logueado es el vendedor

                        if (!mensaje.producto) {
                            return (
                                <div key={mensaje._id} style={{ ...styles.card, borderLeft: '5px solid #dc3545' }}>
                                    <p style={styles.messageType}>⚠️ Artículo Retirado</p>
                                    <p><strong>De:</strong> {mensaje.emisor.nombres}</p>
                                    <div style={styles.contentBox}>
                                        Este artículo ya fue eliminado del Marketplace.
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={mensaje._id} style={styles.card}>
                                <p style={styles.messageType}>
                                    {mensaje.tipoMensaje.includes('COMPRA') ? '🛒 Interés de Compra' :
                                     mensaje.tipoMensaje.includes('DONACION') ? '🎁 Interés de Donación' :
                                     '💬 Coordinación'}
                                </p>
                                <h3 style={styles.productTitle}>{mensaje.producto?.Nombre_Producto}</h3>
                                <p><strong>De:</strong> {mensaje.emisor.nombres}</p>
                                <div style={styles.contentBox}>
                                    <strong>Mensaje:</strong> {mensaje.contenido}
                                </div>
                                <p style={styles.date}>{new Date(mensaje.createdAt).toLocaleString()}</p>

                                {/* ✅ Botón solo para el vendedor */}
                                {esVendedor && (
                                    <button
                                        style={styles.retirarButton}
                                        onClick={() => handleRetirarProducto(mensaje.producto._id, mensaje.producto.Nombre_Producto)}
                                    >
                                        ✅ Transacción Cerrada y Retirar Artículo
                                    </button>
                                )}

                                {/* ✅ Botón visible para ambos */}
                                <button
                                    style={styles.replyButton}
                                    onClick={() => handleReply(mensaje)}
                                >
                                    💬 Coordinar / Responder
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// 🎨 Estilos
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
    retirarButton: {
        padding: '8px 15px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '10px',
        fontWeight: 'bold',
        width: '100%',
    },
    replyButton: {
        padding: '8px 15px',
        backgroundColor: '#ffc107',
        color: 'black',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '8px',
        width: '100%',
    },
};

export default BandejaMensajes;
