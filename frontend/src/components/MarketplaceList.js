import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Comentarios from './Comentarios'; 
import { FaTimes } from 'react-icons/fa'; // Importar el icono X para eliminar
import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/productos`;
const MENSAJE_API_URL = 'http://localhost:5000/api/mensajes'; 

const MarketplaceList = () => {
    // Hooks en el nivel superior del componente
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [comentarioProductoId, setComentarioProductoId] = useState(null); 
    
    const REAL_TOKEN = localStorage.getItem('userToken');
    const navigate = useNavigate(); 
    const loggedInUserId = REAL_TOKEN ? JSON.parse(atob(REAL_TOKEN.split('.')[1])).id : null; 

    const getConfig = useCallback(() => ({
        headers: { Authorization: `Bearer ${REAL_TOKEN}` },
        params: { q: searchTerm } 
    }), [REAL_TOKEN, searchTerm]); 

    // Función para Consumir la API
    const fetchProductos = useCallback(async () => {
        if (!REAL_TOKEN) { navigate('/login'); return; }
        try {
            const response = await axios.get(API_URL, getConfig());
            setProductos(response.data);
            setLoading(false);
        } catch (error) {
            Swal.fire('Error', 'No se pudo cargar el Marketplace. Inténtalo más tarde.', 'error');
            setLoading(false);
        }
    }, [REAL_TOKEN, navigate, getConfig]);


    // NUEVA FUNCIÓN PARA ELIMINAR EL PRODUCTO DESDE LA CARD (Usada por el Vendedor)
    const handleDeleteProduct = async (productId, productName) => {
        const result = await Swal.fire({
            title: '¿Confirmar Retiro?',
            text: `¿Estás seguro de que deseas retirar "${productName}" del Marketplace (Vendido/Donado)?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545', // Rojo para confirmar eliminación
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, Retirar',
        });

        if (result.isConfirmed) {
            try {
                // Llama a la API DELETE /api/productos/:id
                await axios.delete(`${API_URL}/${productId}`, getConfig()); 
                Swal.fire('Retirado!', `El artículo "${productName}" ha sido eliminado.`, 'success');
                fetchProductos(); // Refrescar la lista
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Fallo al retirar. Solo el publicador puede hacerlo.', 'error');
            }
        }
    };


    // FUNCIÓN handleTransaction (Mensajería de Interés)
    const handleTransaction = (producto) => {
        if (producto.ID_Usuario._id === loggedInUserId) {
            Swal.fire('Error', 'No puedes enviarte un mensaje de interés en tu propio artículo.', 'warning');
            return;
        }

        Swal.fire({
            title: `Mensaje de Interés en ${producto.Nombre_Producto}`,
            html: `
                <p style="text-align: left;">Estás a punto de enviar un mensaje privado al vendedor para coordinar la entrega o compra.</p>
                <textarea id="swal-input-mensaje" placeholder="Escribe tu mensaje interno para coordinar (Ej: ¿Podríamos vernos el sábado?)..." 
                maxlength="200" style="width: 100%; height: 100px; padding: 10px; resize: vertical; border-radius: 6px;"></textarea>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: `Enviar Interés`,
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const mensaje = document.getElementById('swal-input-mensaje').value;
                if (!mensaje.trim()) {
                    Swal.showValidationMessage('El mensaje no puede estar vacío.');
                }
                return mensaje;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const mensajeContenido = result.value;
                
                try {
                    const data = {
                        productoId: producto._id,
                        contenido: mensajeContenido,
                        tipoMensaje: producto.Tipo === 'Venta' ? 'INTERES_COMPRA' : 'INTERES_DONACION' 
                    };
                    
                    await axios.post(MENSAJE_API_URL, data, getConfig()); 

                    Swal.fire({
                        title: '¡Mensaje Enviado!',
                        text: `Tu mensaje interno ha sido enviado. El vendedor ha sido notificado y se comunicará contigo.`,
                        icon: 'success'
                    });

                } catch (error) {
                    Swal.fire('Error', error.response?.data?.message || 'Fallo al enviar el mensaje de interés. Asegúrate de tener un usuario logueado.', 'error');
                }
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
                {productos.map((producto) => {
                    const isOwnProduct = producto.ID_Usuario._id === loggedInUserId;

                    // Lógica de hover CSS (Mantenido)
                    
                    return (
                        <div key={producto._id} >
                            
                            <div 
                                style={styles.card}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.01)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                                    const img = e.currentTarget.querySelector('img');
                                    if (img) img.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = styles.card.boxShadow;
                                    const img = e.currentTarget.querySelector('img');
                                    if (img) img.style.transform = 'scale(1)';
                                }}
                            >
                                
                                {/* IMAGEN DEL PRODUCTO (CLICKABLE) */}
                                <div 
                                    style={styles.imageWrapper}
                                    onClick={() => navigate(`/productos/${producto._id}`)}
                                >
                                    {producto.Foto_Producto ? (
                                        <img 
                                            src={`http://localhost:5000/${producto.Foto_Producto}`} 
                                            alt={producto.Nombre_Producto} 
                                            style={{...styles.image, transition: 'transform 0.3s'}}
                                        />
                                    ) : (
                                        <div style={styles.noImage}>[Imagen No Disponible]</div>
                                    )}

                                    {/* BOTÓN DE ELIMINACIÓN RÁPIDA (Solo para el Propietario) */}
                                    {isOwnProduct && (
                                        <button 
                                            style={styles.deleteButtonOverlay}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevenir que se abra la vista de detalle
                                                handleDeleteProduct(producto._id, producto.Nombre_Producto);
                                            }}
                                        >
                                            <FaTimes size={18} />
                                        </button>
                                    )}
                                </div>

                                <div style={styles.cardBody}>
                                    
                                    {/* INFORMACIÓN */}
                                    <h3 style={styles.cardTitle}>{producto.Nombre_Producto}</h3>
                                    <p style={styles.authorText}>
                                        Publicado por: <strong>{producto.ID_Usuario?.nombres || 'Usuario Desconocido'}</strong>
                                    </p>
                                    
                                    {/* UBICACIÓN Y PRECIO */}
                                    <div style={styles.priceLocationGroup}>
                                        <p style={styles.locationText}>📍 {producto.Ubicacion}</p>
                                        <p style={styles.cardPrice}>
                                            {producto.Tipo === 'Venta' ? `$ ${formatCOP(producto.Precio)}` : '¡DONACIÓN!'}
                                        </p>
                                    </div>
                                    
                                    {/* INSIGNIAS */}
                                    <div style={styles.badgeGroup}>
                                        <span style={styles.badge}>{producto.Categoria}</span>
                                        <span style={styles.estado}>{producto.Estado}</span>
                                    </div>
                                    
                                    {/* BOTONES DE ACCIÓN */}
                                    <div style={styles.actionButtons}>
                                        
                                        {/* BOTÓN 1: COMENTARIOS */}
                                        <button onClick={() => toggleComentarios(producto._id)} style={styles.commentButton}>
                                            {comentarioProductoId === producto._id ? 'Ocultar Comentarios' : 'Ver Comentarios'}
                                        </button>
                                        
                                        {/* BOTÓN 2: TRANSACCIÓN/MENSAJE (Botón Principal) */}
                                        <button 
                                            onClick={() => handleTransaction(producto)} 
                                            style={isOwnProduct ? styles.ownProductButton : (producto.Tipo === 'Venta' ? styles.buyButton : styles.donateButton)}
                                            disabled={isOwnProduct} 
                                        >
                                            {isOwnProduct ? 'Tu Artículo' : (producto.Tipo === 'Venta' ? 'Comprar Artículo' : 'Solicitar Donación')}
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {productos.length === 0 && <p style={{textAlign: 'center', marginTop: '50px', fontSize: '1.2em'}}>No hay artículos disponibles. ¡Sé el primero en publicar!</p>}

            {/* Renderizado del componente de Comentarios */}
            {comentarioProductoId && (
                <div style={styles.comentariosWrapper}>
                    <Comentarios publicacionId={comentarioProductoId} />
                </div>
            )}
            
        </div>
    );
};

// Función para formatear el precio a la convención colombiana
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


// --- ESTILOS REFACTORIZADOS Y MEJORADOS ---
const styles = {
    // LAYOUT GENERAL
    pageContainer: { 
        padding: '20px 40px', 
        backgroundColor: '#f0f2f5',
        minHeight: 'calc(100vh - 70px)', 
    },
    title: { textAlign: 'center', color: '#1A4D2E', marginBottom: '30px', fontSize: '2em' },
    
    // BARRA DE BÚSQUEDA
    searchBar: {
        display: 'flex',
        maxWidth: '800px',
        margin: '0 auto 30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    searchInput: { flexGrow: 1, padding: '12px', border: 'none', fontSize: '16px', outline: 'none' },
    searchButton: {
        padding: '12px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.3s',
    },
    
    // GRID Y TARJETA
    grid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '25px', 
    },
    card: { 
        border: '1px solid #e0e0e0',
        borderRadius: '12px', 
        overflow: 'hidden', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        backgroundColor: 'white', 
        transition: 'all 0.3s ease-in-out',
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer'
    },
    imageWrapper: { 
        height: '180px', 
        overflow: 'hidden', 
        borderBottom: '1px solid #eee', 
        transition: 'transform 0.3s',
        position: 'relative', // NECESARIO para el botón de superposición
    }, 
    image: { width: '100%', height: '100%', objectFit: 'cover' },
    noImage: { height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', color: '#aaa', fontSize: '1.1em' },
    
    // BOTÓN DE ELIMINAR RÁPIDA (SUPERPUESTO)
    deleteButtonOverlay: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(220, 53, 69, 0.9)', // Rojo semitransparente
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10, // Asegura que esté por encima de la imagen
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        transition: 'background-color 0.2s',
    },
    
    cardBody: { padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column' }, 
    
    // INFORMACIÓN
    cardTitle: { fontSize: '1.3em', fontWeight: 'bold', marginBottom: '5px', color: '#333' },
    authorText: { fontSize: '0.8em', color: '#777', marginBottom: '8px', fontStyle: 'italic' },
    locationText: { fontSize: '0.9em', color: '#555', fontWeight: '600', marginBottom: '10px' },
    
    // PRECIO Y UBICACIÓN GRUPO
    priceLocationGroup: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingBottom: '10px',
        borderBottom: '1px solid #eee',
    },
    cardPrice: { 
        fontSize: '1.5em', 
        fontWeight: 'extrabold', 
        color: '#1A4D2E', 
        margin: '0',
    },
    
    // INSIGNIAS
    badgeGroup: { 
        marginBottom: '15px', 
        marginTop: 'auto', 
        paddingTop: '10px', 
        borderTop: '1px solid #eee',
        display: 'flex',
        gap: '8px',
    },
    badge: { 
        backgroundColor: '#e6f7ff', 
        color: '#1890ff', 
        padding: '4px 10px', 
        borderRadius: '15px', 
        fontSize: '0.75em',
        fontWeight: 'bold'
    },
    estado: { 
        backgroundColor: '#fffbe6', 
        color: '#faad14', 
        padding: '4px 10px', 
        borderRadius: '15px', 
        fontSize: '0.75em',
        fontWeight: 'bold'
    },
    
    // BOTONES DE ACCIÓN
    actionButtons: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    commentButton: {
        width: '100%', padding: '10px', backgroundColor: '#337ab7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
        transition: 'background-color 0.2s',
    },
    buyButton: { 
        width: '100%', padding: '10px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
    },
    donateButton: { 
        width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
    },
    ownProductButton: { 
        width: '100%', padding: '10px', backgroundColor: '#e9ecef', color: '#6c757d', border: '1px solid #ccc', borderRadius: '6px', fontWeight: 'bold',
    },
    comentariosWrapper: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        marginTop: '30px',
        marginBottom: '30px',
    }
};

export default MarketplaceList;










