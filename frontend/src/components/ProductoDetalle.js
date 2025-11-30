import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, BrowserRouter, Routes, Route } from 'react-router-dom';

// --- CONFIGURACIÓN DE URL AUTOCONTENIDA ---
const API_BASE_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) 
    ? process.env.REACT_APP_API_URL 
    : 'http://localhost:5000/api';

const SERVER_URL = API_BASE_URL.replace(/\/api$/, '');

const formatCOP = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return '0';
    return new Intl.NumberFormat('es-CO', { style: 'decimal', maximumFractionDigits: 0 }).format(number);
};

// --- LÓGICA INTERNA DEL COMPONENTE ---
const ProductoDetalleContent = () => {
    // Intentamos obtener el ID de los parámetros. Si no existe (en vista previa), usamos uno de prueba '1'.
    const params = useParams();
    const id = params.id || '1'; 
    const navigate = useNavigate();
    
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const REAL_TOKEN = localStorage.getItem('userToken');

    const showAlert = (title, text) => alert(`${title}: ${text}`);

    const fetchProductoDetalle = useCallback(async () => {
        // En modo vista previa, si no hay token, simulamos uno para no bloquear la vista
        const token = REAL_TOKEN || 'demo-token';

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_BASE_URL}/productos/${id}`, config);
            setProducto(response.data);
            setLoading(false);
        } catch (error) {
            console.warn("Backend no conectado o error de red. Cargando datos de demostración...");
            
            // --- DATOS MOCK PARA VISTA PREVIA ---
            // Esto asegura que veas el diseño incluso si el backend falla
            const mockProduct = {
                _id: '1',
                Nombre_Producto: 'Bicicleta Montañera (Demo)',
                Precio: 450000,
                Tipo: 'Venta',
                Descripcion: 'Esta es una vista previa con datos simulados porque no se pudo conectar al servidor.',
                Estado: 'Usado - Como nuevo',
                Ubicacion: 'Bogotá D.C.',
                Foto_Producto: null // null para probar el placeholder
            };
            setProducto(mockProduct);
            setLoading(false);
        }
    }, [id, REAL_TOKEN]);

    useEffect(() => {
        fetchProductoDetalle();
    }, [fetchProductoDetalle]);

    if (loading) return <div style={styles.pageContainer}>Cargando detalles...</div>;
    
    // Verificación de seguridad por si producto es null (aunque el mock debería evitarlo)
    if (!producto) return <div style={styles.pageContainer}>Producto no encontrado.</div>;

    const imagePath = producto.Foto_Producto 
        ? `${SERVER_URL}/${producto.Foto_Producto.replace(/\\/g, '/')}` 
        : null;

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h1 style={styles.title}>Descripción del producto</h1>

                <div style={styles.contentWrapper}>
                    <div style={styles.productImageContainer}>
                        {imagePath ? (
                            <img 
                                src={imagePath} 
                                alt={producto.Nombre_Producto} 
                                style={styles.productImage} 
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
                                }}
                            />
                        ) : (
                            <div style={styles.noImage}>[Imagen No Disponible]</div>
                        )}
                    </div>

                    <h2 style={styles.productTitle}>{producto.Nombre_Producto}</h2>
                    <p style={styles.productPrice}>
                        {producto.Tipo === 'Venta' ? `$ ${formatCOP(producto.Precio)} COP` : 'Donación'}
                    </p>

                    <h3 style={styles.sectionTitle}>Descripción</h3>
                    <p style={styles.productDescription}>{producto.Descripcion}</p>

                    <div style={styles.detailsGroup}>
                        <p style={styles.detailItem}><strong>Condición:</strong> {producto.Estado}</p>
                        <p style={styles.detailItem}><strong>Tipo:</strong> {producto.Tipo}</p>
                        <p style={styles.detailItem}><strong>Ubicación:</strong> {producto.Ubicacion}</p>
                    </div>

                    <div style={styles.buttonGroup}>
                        <button 
                            style={styles.backButton}
                            onClick={() => navigate('/')}
                        >
                            Volver
                        </button>
                        <button 
                            style={producto.Tipo === 'Venta' ? styles.buyButton : styles.donateButton}
                            onClick={() => showAlert('Info', 'Funcionalidad de compra en desarrollo.')}
                        >
                            🛒 {producto.Tipo === 'Venta' ? 'Comprar' : 'Solicitar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL CON ROUTER ---
// Envolvemos el contenido en un Router para que funcione en la vista previa aislada.
// Nota: Si usas esto dentro de tu App.js que YA tiene Router, puedes usar solo <ProductoDetalleContent />
const ProductoDetalle = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta comodín para capturar cualquier ID en la vista previa */}
                <Route path="/productos/:id" element={<ProductoDetalleContent />} />
                <Route path="*" element={<ProductoDetalleContent />} />
            </Routes>
        </BrowserRouter>
    );
};

// --- ESTILOS ---
const styles = {
    pageContainer: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '30px 0', fontFamily: 'Arial, sans-serif' },
    card: { width: '100%', maxWidth: '800px', padding: '30px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', textAlign: 'left' },
    title: { fontSize: '2.2em', fontWeight: 'bold', color: '#333', marginBottom: '25px', textAlign: 'center' },
    contentWrapper: { display: 'flex', flexDirection: 'column' },
    productImageContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: '20px' },
    productImage: { width: 'auto', maxWidth: '100%', maxHeight: '400px', height: 'auto', borderRadius: '8px', objectFit: 'contain', border: '1px solid #ddd' },
    noImage: { width: '100%', maxWidth: '350px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', color: '#aaa', borderRadius: '8px', border: '1px solid #ddd' },
    productTitle: { fontSize: '2em', fontWeight: 'bold', color: '#333', marginBottom: '10px' },
    productPrice: { fontSize: '1.6em', fontWeight: '600', color: '#4CAF50', marginBottom: '15px' },
    sectionTitle: { fontSize: '1.5em', fontWeight: 'bold', color: '#333', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '5px' },
    productDescription: { fontSize: '1.1em', color: '#555', lineHeight: '1.5', marginBottom: '20px' },
    detailsGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '25px', fontSize: '1.05em', color: '#444' },
    detailItem: { margin: '0' },
    buttonGroup: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' },
    backButton: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1em' },
    buyButton: { backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 25px', fontSize: '1.2em', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
    donateButton: { backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 25px', fontSize: '1.2em', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }
};

export default ProductoDetalle;