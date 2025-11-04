import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; // Asegúrate de que useNavigate esté importado
import Comentarios from './Comentarios'; 

const API_URL = 'http://localhost:5000/api/productos';

const MarketplaceList = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [comentarioProductoId, setComentarioProductoId] = useState(null); 
    
    const REAL_TOKEN = localStorage.getItem('userToken');
    const navigate = useNavigate(); // <-- Instancia de useNavigate

    // ... (Funciones getConfig, fetchProductos, handleTransaction, useEffect, etc. permanecen iguales) ...
    // ...

    // Función para obtener la configuración de Headers
    const getConfig = useCallback(() => ({
        headers: { Authorization: `Bearer ${REAL_TOKEN}` },
        params: { q: searchTerm } 
    }), [REAL_TOKEN, searchTerm]); 

    // Función para Consumir la API
    const fetchProductos = useCallback(async () => {
        if (!REAL_TOKEN) {
            navigate('/login');
            return;
        }

        try {
            const response = await axios.get(API_URL, getConfig());
            setProductos(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            Swal.fire('Error', 'No se pudo cargar el Marketplace. Inténtalo más tarde.', 'error');
            setLoading(false);
        }
    }, [REAL_TOKEN, navigate, getConfig]);

    const handleTransaction = (producto) => {
        Swal.fire({
            title: `Confirmar ${producto.Tipo}`,
            text: `¿Deseas proceder con la ${producto.Tipo} de ${producto.Nombre_Producto} por ${producto.Tipo === 'Venta' ? `$${producto.Precio.toFixed(2)}` : '0 (Donación)'}?`,
            icon: producto.Tipo === 'Venta' ? 'question' : 'info',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Procesando', 'Simulando transacción... Implementar la lógica completa en el componente Transacciones.', 'info');
            }
        });
    };

    useEffect(() => {
        fetchProductos();
    }, [fetchProductos]); 

    const handleSearchClick = (e) => {
        e.preventDefault();
        fetchProductos();
    };

    const toggleComentarios = (id) => {
        setComentarioProductoId(comentarioProductoId === id ? null : id);
    };

    if (loading) return <div style={styles.pageContainer}>Cargando Marketplace...</div>;

    return (
        <div style={styles.pageContainer}>
            
            {/* BARRA DE BÚSQUEDA */}
            <form onSubmit={handleSearchClick} style={styles.searchBar}>
                <input
                    type="text"
                    placeholder="Buscar artículos (Mueble, Bicicleta, Usado, etc.)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
                <button type="submit" style={styles.searchButton}>
                    Buscar
                </button>
            </form>
            
            <h2 style={styles.title}>Marketplace de Artículos Ecológicos ({productos.length})</h2>
            
            <div style={styles.grid}>
                {productos.map((producto) => (
                    <div key={producto._id} style={styles.card}>
                        
                        {/* IMAGEN DEL PRODUCTO (AÑADIR onClick para Navegación) */}
                        <div 
                            style={styles.imageWrapper}
                            onClick={() => navigate(`/productos/${producto._id}`)} // <-- REDIRECCIÓN AL HACER CLIC
                        >
                             {producto.Foto_Producto ? (
                                <img 
                                    src={`http://localhost:5000/${producto.Foto_Producto}`} 
                                    alt={producto.Nombre_Producto} 
                                    style={styles.image} 
                                />
                             ) : (
                                <div style={styles.noImage}>[Imagen No Disponible]</div>
                             )}
                        </div>

                        <div style={styles.cardBody}>
                            {/* NOMBRE DEL PRODUCTO */}
                            <h3 style={styles.cardTitle}>{producto.Nombre_Producto}</h3>
                            
                            {/* UBICACIÓN */}
                            <p style={styles.locationText}>
                                📍 {producto.Ubicacion}
                            </p>

                            {/* PRECIO O DONACIÓN */}
                            <p style={styles.cardPrice}>
                                {producto.Tipo === 'Venta' ? `$${producto.Precio.toFixed(2)}` : '¡DONACIÓN GRATIS!'}
                            </p>

                            {/* INSIGNIAS */}
                            <div style={styles.badgeGroup}>
                                <span style={styles.badge}>{producto.Categoria}</span>
                                <span style={styles.estado}>{producto.Estado}</span>
                            </div>
                            
                            {/* BOTÓN DE COMENTARIOS */}
                            <button 
                                onClick={() => toggleComentarios(producto._id)} 
                                style={styles.commentButton}
                            >
                                {comentarioProductoId === producto._id ? 'Ocultar Comentarios' : 'Ver Comentarios'}
                            </button>
                            
                            {/* BOTÓN DE TRANSACCIÓN */}
                            <button 
                                onClick={() => handleTransaction(producto)} 
                                style={producto.Tipo === 'Venta' ? styles.buyButton : styles.donateButton}
                            >
                                {producto.Tipo === 'Venta' ? 'Comprar Artículo' : 'Solicitar Donación'}
                            </button>

                        </div>
                    </div>
                ))}
            </div>
            {productos.length === 0 && <p style={{textAlign: 'center', marginTop: '50px'}}>No hay artículos disponibles. ¡Sé el primero en publicar!</p>}

            {/* Renderizado del componente de Comentarios */}
            {comentarioProductoId && (
                <div style={styles.comentariosWrapper}>
                    <Comentarios publicacionId={comentarioProductoId} />
                </div>
            )}
            
        </div>
    );
};

// --- Estilos Ajustados para Compacidad ---
const styles = {
    pageContainer: { 
        padding: '20px 40px', 
        backgroundColor: '#f0f2f5',
        minHeight: 'calc(100vh - 70px)', 
    },
    title: { textAlign: 'center', color: '#333', marginBottom: '30px' }, // Menos margen abajo
    
    // --- ESTILOS DE BÚSQUEDA ---
    searchBar: {
        display: 'flex',
        marginBottom: '30px',
        maxWidth: '700px',
        margin: '0 auto 30px', // Menos margen abajo
    },
    searchInput: { flexGrow: 1, padding: '10px', borderRadius: '8px 0 0 8px', border: '1px solid #ddd', fontSize: '15px', outline: 'none' }, // Padding más pequeño
    searchButton: {
        padding: '10px 18px', // Padding más pequeño
        backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.3s',
    },
    // --- FIN ESTILOS BÚSQUEDA ---
    
    grid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Ancho mínimo más pequeño
        gap: '20px', // Menos espacio entre tarjetas
    },
    card: { 
        border: 'none', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        backgroundColor: 'white', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column',
    },
    imageWrapper: { height: '180px', overflow: 'hidden', borderBottom: '1px solid #eee' }, // Altura de imagen reducida
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    noImage: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', color: '#aaa' },
    
    cardBody: { padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column' }, // Padding más pequeño
    
    // --- ESTILOS DE TEXTO ---
    cardTitle: { fontSize: '1.2em', marginBottom: '3px', color: '#333' }, // Tamaño de título más pequeño
    locationText: { fontSize: '0.85em', color: '#777', marginBottom: '8px', fontWeight: '500' }, // Tamaño de texto más pequeño
    badgeGroup: { 
        marginBottom: '10px', 
        marginTop: 'auto', 
        paddingTop: '8px', // Menos padding
        borderTop: '1px solid #eee'
    },
    
    badge: { backgroundColor: '#e6f7ff', color: '#1890ff', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7em', marginRight: '5px' },
    estado: { backgroundColor: '#fffbe6', color: '#faad14', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7em' },
    
    cardPrice: { 
        fontSize: '1.5em', // Tamaño de precio reducido
        fontWeight: 'bold', color: '#4CAF50', marginTop: '5px', marginBottom: '10px',
    },
    // --- ESTILOS DE BOTONES ---
    commentButton: {
        width: '100%', padding: '8px', // Padding más pequeño
        backgroundColor: '#337ab7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '8px',
    },
    buyButton: { 
        width: '100%', padding: '10px', // Padding más pequeño
        backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
    },
    donateButton: { 
        width: '100%', padding: '10px', // Padding más pequeño
        backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
    },
    comentariosWrapper: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        marginTop: '20px',
        marginBottom: '20px',
    }
};

export default MarketplaceList;





