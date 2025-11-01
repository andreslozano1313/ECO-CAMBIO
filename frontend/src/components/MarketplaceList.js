import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/productos';

const MarketplaceList = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const REAL_TOKEN = localStorage.getItem('userToken');
    const navigate = useNavigate();

    useEffect(() => {
        if (!REAL_TOKEN) {
            navigate('/login');
            return;
        }

        const fetchProductos = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${REAL_TOKEN}`,
                    },
                };
                const response = await axios.get(API_URL, config);
                setProductos(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error al obtener productos:", error);
                Swal.fire('Error', 'No se pudo cargar el Marketplace. Inténtalo más tarde.', 'error');
                setLoading(false);
            }
        };
        fetchProductos();
    }, [REAL_TOKEN, navigate]);

    const handleTransaction = (producto) => {
        // En una app real, esto abriría un modal de confirmación de compra/donación 
        // y consumiría la API de simulación de pago POST /api/transacciones/simular
        Swal.fire({
            title: `Confirmar ${producto.Tipo}`,
            text: `¿Deseas proceder con la ${producto.Tipo} de ${producto.Nombre_Producto} por $${producto.Precio.toFixed(2)}?`,
            icon: producto.Tipo === 'Venta' ? 'question' : 'info',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
        }).then((result) => {
            if (result.isConfirmed) {
                // Aquí iría la llamada a POST /api/transacciones/simular
                Swal.fire('Procesando', 'Simulando transacción... Esto se implementará en la fase final de lógica.', 'info');
            }
        });
    };

    if (loading) return <div style={styles.container}>Cargando Marketplace...</div>;

    return (
        <div style={styles.container}>
            <h2>Marketplace Ecológico: {productos.length} Artículos disponibles</h2>
            <div style={styles.grid}>
                {productos.map((producto) => (
                    <div key={producto._id} style={styles.card}>
                        {/* Muestra la imagen si la URL existe */}
                        {producto.Foto_Producto && (
                            <img 
                                src={`http://localhost:5000/${producto.Foto_Producto}`} 
                                alt={producto.Nombre_Producto} 
                                style={styles.image} 
                            />
                        )}
                        
                        <div style={styles.cardBody}>
                            <h3 style={styles.cardTitle}>{producto.Nombre_Producto}</h3>
                            <p><strong>Tipo:</strong> {producto.Tipo}</p>
                            <p><strong>Categoría:</strong> {producto.Categoria}</p>
                            <p><strong>Ubicación:</strong> {producto.Ubicacion}</p>
                            <p style={styles.cardPrice}>
                                {producto.Tipo === 'Venta' ? `$${producto.Precio.toFixed(2)}` : '¡DONACIÓN!'}
                            </p>
                            <button 
                                onClick={() => handleTransaction(producto)} 
                                style={producto.Tipo === 'Venta' ? styles.buyButton : styles.donateButton}
                            >
                                {producto.Tipo === 'Venta' ? 'Comprar' : 'Donar'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Estilos simples
const styles = {
    container: { padding: '20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: { border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    image: { width: '100%', height: '200px', objectFit: 'cover' },
    cardBody: { padding: '15px' },
    cardTitle: { fontSize: '1.2em', marginBottom: '5px' },
    cardPrice: { fontSize: '1.5em', fontWeight: 'bold', color: '#28a745' },
    buyButton: { width: '100%', padding: '10px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' },
    donateButton: { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' },
};

export default MarketplaceList;