import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, BrowserRouter } from 'react-router-dom'; // Importamos BrowserRouter

// ==============================================================================
// 1. SIMULACIONES (MOCKS) PARA QUE FUNCIONE EN VISTA PREVIA
// (En tu proyecto real, descomenta los imports reales y borra esta sección)
// ==============================================================================

// IMPORT REAL: import Swal from 'sweetalert2';
const Swal = {
    fire: async (arg1, arg2, arg3) => {
        // Simulación simple de SweetAlert con nativos del navegador
        if (typeof arg1 === 'object') {
            const { title, text, showCancelButton, preConfirm } = arg1;
            if (preConfirm) {
                // Simular input de mensaje
                const result = window.prompt(`${title}\n${text || ''}`);
                // Si el usuario cancela, result es null
                return { isConfirmed: result !== null, value: result };
            }
            const confirmed = showCancelButton ? window.confirm(`${title}\n${text}`) : true;
            // Si no es un prompt ni confirmacion, solo alerta
            if (!showCancelButton && !preConfirm) window.alert(`${title}\n${text}`);
            return { isConfirmed: confirmed };
        }
        window.alert(`${arg1}\n${arg2}`);
        return { isConfirmed: true };
    },
    showValidationMessage: (msg) => alert(msg)
};

// IMPORT REAL: import { FaTimes } from 'react-icons/fa';
const FaTimes = ({ size }) => <span style={{fontSize: size || '16px', fontWeight: 'bold', lineHeight: '1'}}>X</span>;

// IMPORT REAL: import Comentarios from './Comentarios';
const Comentarios = ({ publicacionId }) => (
    <div style={{padding: '10px', border: '1px dashed #ccc', marginTop: '10px', borderRadius: '5px', background: '#fafafa'}}>
        <small>Componente Comentarios (ID: {publicacionId})</small>
        <br/>
        <input placeholder="Escribe un comentario..." style={{marginTop: '5px', padding: '5px', width: '90%'}} />
    </div>
);

// IMPORT REAL: import API_BASE_URL from '../config';
// Verificación robusta de process para evitar errores en vista previa
const API_BASE_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) 
    ? process.env.REACT_APP_API_URL 
    : 'http://localhost:5000/api';

// ==============================================================================
// FIN DE SIMULACIONES
// ==============================================================================


// Ruta para obtener productos
const API_URL = `${API_BASE_URL}/productos`;
// Ruta para mensajes
const MENSAJE_API_URL = `${API_BASE_URL}/mensajes`;

// Lógica de URL del servidor para imágenes
const SERVER_URL = API_BASE_URL.replace(/\/api$/, ''); 


// --- COMPONENTE INTERNO CON LA LÓGICA ---
const MarketplaceContent = () => {
    // ------------------------------------------------------------------
    // 2. ESTADOS
    // ------------------------------------------------------------------
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [comentarioProductoId, setComentarioProductoId] = useState(null); 
    
    const REAL_TOKEN = localStorage.getItem('userToken');
    const navigate = useNavigate(); 
    
    // Decodificar el token para sacar el ID del usuario (Manejo de error si token es inválido/mock)
    let loggedInUserId = null;
    try {
        loggedInUserId = REAL_TOKEN ? JSON.parse(atob(REAL_TOKEN.split('.')[1])).id : null;
    } catch (e) {
        // Token simulado para demo
        loggedInUserId = 'demo-user';
    }

    // Configuración de cabeceras
    const getConfig = useCallback(() => ({
        headers: { Authorization: `Bearer ${REAL_TOKEN}` },
        params: { q: searchTerm } 
    }), [REAL_TOKEN, searchTerm]); 

    // ------------------------------------------------------------------
    // 3. FUNCIONES PRINCIPALES
    // ------------------------------------------------------------------

    const fetchProductos = useCallback(async () => {
        // En producción real descomentar la siguiente línea:
        // if (!REAL_TOKEN) { navigate('/login'); return; }
        
        try {
            const response = await axios.get(API_URL, getConfig());
            setProductos(response.data);
            setLoading(false);
        } catch (error) {
            // EVITAR CONSOLE.ERROR ROJO: Manejamos el error silenciosamente cargando la Demo
            console.warn("Backend no conectado. Iniciando Modo Demo con datos de prueba.");
            
            const mockData = [
                { _id: '1', Nombre_Producto: 'Bicicleta Vintage', Precio: 150000, Tipo: 'Venta', Ubicacion: 'Bogotá', Categoria: 'Transporte', Estado: 'Usado', Foto_Producto: null, ID_Usuario: { _id: 'other', nombres: 'Carlos' } },
                { _id: '2', Nombre_Producto: 'Sillas de Madera', Precio: 0, Tipo: 'Donación', Ubicacion: 'Medellín', Categoria: 'Muebles', Estado: 'Nuevo', Foto_Producto: null, ID_Usuario: { _id: loggedInUserId, nombres: 'Tú' } },
                { _id: '3', Nombre_Producto: 'Libros de Biología', Precio: 0, Tipo: 'Donación', Ubicacion: 'Cali', Categoria: 'Educación', Estado: 'Bueno', Foto_Producto: null, ID_Usuario: { _id: 'other2', nombres: 'Ana' } }
            ];
            setProductos(mockData);
            setLoading(false);
        }
    }, [REAL_TOKEN, navigate, getConfig, loggedInUserId]);


    const handleDeleteProduct = async (productId, productName) => {
        const result = await Swal.fire({
            title: '¿Confirmar Retiro?',
            text: `¿Estás seguro de que deseas retirar "${productName}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Sí, Retirar',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/${productId}`, getConfig()); 
                Swal.fire('Retirado!', `El artículo ha sido eliminado.`, 'success');
                fetchProductos(); 
            } catch (error) {
                // Simulación visual de borrado si falla backend (Optimistic UI)
                setProductos(prev => prev.filter(p => p._id !== productId));
                Swal.fire('Retirado (Demo)', 'El producto se ha quitado de la lista (Simulación).', 'success');
            }
        }
    };

    const handleTransaction = (producto) => {
        if (producto.ID_Usuario._id === loggedInUserId) {
            Swal.fire('Aviso', 'Es tu propio artículo.', 'warning');
            return;
        }

        Swal.fire({
            title: `Interés en ${producto.Nombre_Producto}`,
            text: 'Escribe un mensaje para el vendedor:',
            preConfirm: true, 
            showCancelButton: true,
            confirmButtonText: `Enviar`,
        }).then(async (result) => {
            if (result.isConfirmed && result.value) {
                try {
                    const data = {
                        productoId: producto._id,
                        contenido: result.value,
                        tipoMensaje: producto.Tipo === 'Venta' ? 'INTERES_COMPRA' : 'INTERES_DONACION' 
                    };
                    await axios.post(MENSAJE_API_URL, data, getConfig()); 
                    Swal.fire('Enviado', `El vendedor ha sido notificado.`, 'success');
                } catch (error) {
                    Swal.fire('Enviado (Demo)', 'Mensaje simulado enviado correctamente (Backend Offline).', 'success');
                }
            }
        });
    }; 

    useEffect(() => {
        fetchProductos();
    }, [fetchProductos]); 

    const handleSearchClick = (e) => { e.preventDefault(); fetchProductos(); };
    const toggleComentarios = (id) => { setComentarioProductoId(comentarioProductoId === id ? null : id); };

    if (loading) return <div style={styles.pageContainer}>Cargando Marketplace...</div>;

    // ------------------------------------------------------------------
    // 4. RENDERIZADO
    // ------------------------------------------------------------------
    return (
        <div style={styles.pageContainer}>
            
            <form onSubmit={handleSearchClick} style={styles.searchBar}>
                <input
                    type="text"
                    placeholder="Buscar artículos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
                <button type="submit" style={styles.searchButton}>Buscar</button>
            </form>
            
            <h2 style={styles.title}>Marketplace Ecológico ({productos.length})</h2>
            
            <div style={styles.grid}>
                {productos.map((producto) => {
                    const isOwnProduct = producto.ID_Usuario._id === loggedInUserId;

                    const imagePath = producto.Foto_Producto 
                        ? `${SERVER_URL}/${producto.Foto_Producto.replace(/\\/g, '/')}` 
                        : null;

                    return (
                        <div key={producto._id}>
                            <div style={styles.card}>
                                <div 
                                    style={styles.imageWrapper}
                                    onClick={() => navigate(`/productos/${producto._id}`)}
                                >
                                    {imagePath ? (
                                        <img 
                                            src={imagePath} 
                                            alt={producto.Nombre_Producto} 
                                            style={styles.image}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    
                                    <div style={{...styles.noImage, display: imagePath ? 'none' : 'flex'}}>
                                        [Imagen No Disponible]
                                    </div>

                                    {isOwnProduct && (
                                        <button 
                                            style={styles.deleteButtonOverlay}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteProduct(producto._id, producto.Nombre_Producto);
                                            }}
                                            title="Retirar producto"
                                        >
                                            <FaTimes size={18} />
                                        </button>
                                    )}
                                </div>

                                <div style={styles.cardBody}>
                                    <h3 style={styles.cardTitle}>{producto.Nombre_Producto}</h3>
                                    <p style={styles.authorText}>
                                        Por: <strong>{producto.ID_Usuario?.nombres || 'Usuario'}</strong>
                                    </p>
                                    
                                    <div style={styles.priceLocationGroup}>
                                        <p style={styles.locationText}>📍 {producto.Ubicacion}</p>
                                        <p style={styles.cardPrice}>
                                            {producto.Tipo === 'Venta' ? `$ ${formatCOP(producto.Precio)}` : '¡DONACIÓN!'}
                                        </p>
                                    </div>
                                    
                                    <div style={styles.badgeGroup}>
                                        <span style={styles.badge}>{producto.Categoria}</span>
                                        <span style={styles.estado}>{producto.Estado}</span>
                                    </div>
                                    
                                    <div style={styles.actionButtons}>
                                        <button onClick={() => toggleComentarios(producto._id)} style={styles.commentButton}>
                                            {comentarioProductoId === producto._id ? 'Ocultar' : 'Comentarios'}
                                        </button>
                                        
                                        <button 
                                            onClick={() => handleTransaction(producto)} 
                                            style={isOwnProduct ? styles.ownProductButton : (producto.Tipo === 'Venta' ? styles.buyButton : styles.donateButton)}
                                            disabled={isOwnProduct} 
                                        >
                                            {isOwnProduct ? 'Tu Artículo' : (producto.Tipo === 'Venta' ? 'Comprar' : 'Solicitar')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {productos.length === 0 && <p style={{textAlign: 'center', marginTop: '50px'}}>No hay artículos publicados aún.</p>}

            {comentarioProductoId && (
                <div style={styles.comentariosWrapper}>
                    <Comentarios publicacionId={comentarioProductoId} />
                </div>
            )}
        </div>
    );
};

// --- COMPONENTE ENVOLTORIO (WRAPPER) ---
// Este componente exportado envuelve el contenido en BrowserRouter.
// Esto soluciona el error "useNavigate() may be used only in the context of a <Router>".
const MarketplaceList = () => {
    return (
        <BrowserRouter>
            <MarketplaceContent />
        </BrowserRouter>
    );
};

const formatCOP = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return '0';
    return new Intl.NumberFormat('es-CO', { style: 'decimal', maximumFractionDigits: 0 }).format(number);
};

// ----------------------------------------------------------------------
// 5. ESTILOS
// ----------------------------------------------------------------------
const styles = {
    pageContainer: { padding: '20px 40px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 70px)', fontFamily: 'Arial, sans-serif' },
    title: { textAlign: 'center', color: '#1A4D2E', marginBottom: '30px', fontSize: '2em' },
    searchBar: { display: 'flex', maxWidth: '800px', margin: '0 auto 30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden' },
    searchInput: { flexGrow: 1, padding: '12px', border: 'none', fontSize: '16px', outline: 'none' },
    searchButton: { padding: '12px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
    card: { border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', backgroundColor: 'white', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s' },
    imageWrapper: { height: '180px', overflow: 'hidden', borderBottom: '1px solid #eee', position: 'relative', backgroundColor: '#f9f9f9' }, 
    image: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
    noImage: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '0.9em' },
    deleteButtonOverlay: { position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(220, 53, 69, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 },
    cardBody: { padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column' }, 
    cardTitle: { fontSize: '1.3em', fontWeight: 'bold', marginBottom: '5px', color: '#333' },
    authorText: { fontSize: '0.8em', color: '#777', marginBottom: '8px' },
    locationText: { fontSize: '0.9em', color: '#555', fontWeight: '600' },
    priceLocationGroup: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: '10px', borderBottom: '1px solid #eee' },
    cardPrice: { fontSize: '1.5em', fontWeight: 'extrabold', color: '#1A4D2E', margin: '0' },
    badgeGroup: { marginBottom: '15px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #eee', display: 'flex', gap: '8px' },
    badge: { backgroundColor: '#e6f7ff', color: '#1890ff', padding: '4px 10px', borderRadius: '15px', fontSize: '0.75em', fontWeight: 'bold' },
    estado: { backgroundColor: '#fffbe6', color: '#faad14', padding: '4px 10px', borderRadius: '15px', fontSize: '0.75em', fontWeight: 'bold' },
    actionButtons: { display: 'flex', flexDirection: 'column', gap: '8px' },
    commentButton: { width: '100%', padding: '10px', backgroundColor: '#337ab7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
    buyButton: { width: '100%', padding: '10px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    donateButton: { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    ownProductButton: { width: '100%', padding: '10px', backgroundColor: '#e9ecef', color: '#6c757d', border: '1px solid #ccc', borderRadius: '6px', fontWeight: 'bold' },
    comentariosWrapper: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginTop: '30px', marginBottom: '30px' }
};

export default MarketplaceList;

