import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const formatCOP = (number) => {
    if (typeof number !== 'number' || isNaN(number)) {
        return '0';
    }
    
    return new Intl.NumberFormat('es-CO', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
};


const ProductoDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const REAL_TOKEN = localStorage.getItem('userToken');

    const fetchProductoDetalle = useCallback(async () => {
        if (!REAL_TOKEN) {
            navigate('/login');
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${REAL_TOKEN}` },
            };
            const response = await axios.get(`${API_BASE_URL}/productos/${id}`, config);
            setProducto(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener detalles del producto:", error);
            Swal.fire('Error', 'No se pudo cargar los detalles del producto.', 'error');
            setLoading(false);
            navigate('/');
        }
    }, [id, REAL_TOKEN, navigate]);

    useEffect(() => {
        fetchProductoDetalle();
    }, [fetchProductoDetalle]);

    if (loading) {
        return <div style={styles.pageContainer}>Cargando detalles del producto...</div>;
    }

    if (!producto) {
        return <div style={styles.pageContainer}>Producto no encontrado.</div>;
    }

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h1 style={styles.title}>Descripción del producto</h1>

                <div style={styles.contentWrapper}>
                    {/* Sección de Imagen (CENTRALIZADA) */}
                    <div style={styles.productImageContainer}>
                        {producto.Foto_Producto ? (
                            <img 
                                src={`http://localhost:5000/${producto.Foto_Producto}`} 
                                alt={producto.Nombre_Producto} 
                                style={styles.productImage} 
                            />
                        ) : (
                            <div style={styles.noImage}>[Imagen No Disponible]</div>
                        )}
                    </div>

                    {/* Nombre y Precio/Donación */}
                    <h2 style={styles.productTitle}>{producto.Nombre_Producto}</h2>
                    <p style={styles.productPrice}>
                        {/* APLICACIÓN DEL FORMATO COP */}
                        {producto.Tipo === 'Venta' ? `$ ${formatCOP(producto.Precio)} COP` : 'Donación'}
                    </p>

                    {/* Descripción */}
                    <h3 style={styles.sectionTitle}>Descripción</h3>
                    <p style={styles.productDescription}>{producto.Descripcion}</p>

                    {/* Detalles Adicionales */}
                    <div style={styles.detailsGroup}>
                        <p style={styles.detailItem}><strong>Condición:</strong> {producto.Estado}</p>
                        <p style={styles.detailItem}><strong>Tipo:</strong> {producto.Tipo}</p>
                        <p style={styles.detailItem}><strong>Ubicación:</strong> {producto.Ubicacion}</p>
                    </div>

                    {/* Botón de compra/donación (simulado) */}
                    <button 
                        style={producto.Tipo === 'Venta' ? styles.buyButton : styles.donateButton}
                        onClick={() => Swal.fire('Procesando', 'Simulando transacción... Implementar la lógica completa.', 'info')}
                    >
                        🛒
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Estilos para la Vista de Detalle ---
const styles = {
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '30px 0',
    },
    card: {
        width: '100%',
        maxWidth: '800px',
        padding: '30px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        textAlign: 'left',
    },
    title: {
        fontSize: '2.2em',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '25px',
        textAlign: 'center',
    },
    contentWrapper: {
        display: 'flex',
        flexDirection: 'column',
    },
    productImageContainer: { 
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'center',    
        width: '100%',           
        marginBottom: '20px',
    },
    productImage: {
        width: 'auto',           
        maxWidth: '100%',         
        maxHeight: '400px',       
        height: 'auto',           
        borderRadius: '8px',
        objectFit: 'contain',     
        border: '1px solid #ddd',
    },
    noImage: {
        width: '100%',
        maxWidth: '350px', 
        height: '250px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        color: '#aaa',
        borderRadius: '8px',
        border: '1px solid #ddd',
    },
    productTitle: {
        fontSize: '2em',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
    },
    productPrice: {
        fontSize: '1.6em',
        fontWeight: '600',
        color: '#4CAF50',
        marginBottom: '15px',
    },
    sectionTitle: {
        fontSize: '1.5em',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '8px',
        borderBottom: '1px solid #eee',
        paddingBottom: '5px',
    },
    productDescription: {
        fontSize: '1.1em',
        color: '#555',
        lineHeight: '1.5',
        marginBottom: '20px',
    },
    detailsGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '25px',
        fontSize: '1.05em',
        color: '#444',
    },
    detailItem: {
        margin: '0',
    },
    buyButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        fontSize: '2em',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        alignSelf: 'flex-end',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        transition: 'background-color 0.3s ease',
    },
    donateButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        fontSize: '2em',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        alignSelf: 'flex-end',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        transition: 'background-color 0.3s ease',
    }
};

export default ProductoDetalle;