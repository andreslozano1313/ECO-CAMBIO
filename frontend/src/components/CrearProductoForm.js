import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// Importa tu logo aquí (Asegúrate de que la ruta sea correcta)

const API_URL = 'http://localhost:5000/api/productos';
const CATEGORIAS = ['Electrodoméstico', 'Mueble', 'Ropa', 'Electrónica', 'Otros'];
const ESTADOS = ['Nuevo', 'Usado', 'Para Reutilizar'];

const CrearProductoForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        Nombre_Producto: '',
        Categoria: CATEGORIAS[0],
        Descripcion: '',
        Estado: ESTADOS[0],
        Tipo: 'Venta', // Valor por defecto
        Precio: 0,
        Cantidad_Disponible: 1,
        Ubicacion: '',
    });
    const [foto, setFoto] = useState(null);

    const REAL_TOKEN = localStorage.getItem('userToken');

    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTipoChange = (e) => {
        const newTipo = e.target.value;
        setFormData({ 
            ...formData, 
            Tipo: newTipo, 
            Precio: newTipo === 'Donación' ? 0 : formData.Precio
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.Tipo === 'Venta' && (formData.Precio <= 0 || !formData.Precio)) {
            Swal.fire('Error', 'El precio debe ser mayor a cero para productos de Venta.', 'warning');
            return;
        }
        
        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        if (foto) {
            data.append('foto', foto);
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${REAL_TOKEN}`,
                },
            };
            
            await axios.post(API_URL, data, config);

            Swal.fire('¡Publicado!', 'Tu artículo se ha publicado en el Marketplace.', 'success');
            navigate('/'); // Redirige al Marketplace (que ahora es la ruta raíz)

        } catch (error) {
            console.error('Error al crear producto:', error.response?.data?.message);
            Swal.fire(
                'Error de Publicación',
                error.response?.data?.message || 'Error desconocido al subir el artículo.',
                'error'
            );
        }
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                
                {/* ENCABEZADO */}
                <div style={styles.header}>
                    <img src="/LOGO.jpeg" alt="Eco-Cambio Logo" style={styles.logo} />  
                    <h2 style={styles.title}>Publicar Artículo</h2>
                    <p style={styles.subtitle}>Sube un artículo para vender o donar en el Marketplace Ecológico.</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    
                    {/* CAMPO: Nombre */}
                    <input type="text" name="Nombre_Producto" value={formData.Nombre_Producto} onChange={onChange} placeholder="Nombre del Artículo" required style={styles.input} />

                    {/* CAMPO: Foto */}
                    <label style={styles.fileLabel}>Foto del Artículo (Max. 5MB):</label>
                    <input type="file" onChange={(e) => setFoto(e.target.files[0])} style={styles.input} />

                    {/* GRUPO: Tipo y Precio */}
                    <div style={styles.row}>
                        <div style={styles.col}>
                            <label style={styles.label}>Transacción:</label>
                            <select name="Tipo" value={formData.Tipo} onChange={handleTipoChange} style={styles.select}>
                                <option value="Venta">Venta</option>
                                <option value="Donación">Donación</option>
                            </select>
                        </div>
                        {formData.Tipo === 'Venta' && (
                            <div style={styles.col}>
                                <label style={styles.label}>Precio ($):</label>
                                <input type="number" name="Precio" value={formData.Precio} onChange={onChange} placeholder="Precio" required style={styles.select} min="0.01" step="0.01" />
                            </div>
                        )}
                    </div>
                    
                    {/* GRUPO: Categoría y Estado */}
                    <div style={styles.row}>
                        <div style={styles.col}>
                            <label style={styles.label}>Categoría:</label>
                            <select name="Categoria" value={formData.Categoria} onChange={onChange} style={styles.select}>
                                {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div style={styles.col}>
                            <label style={styles.label}>Estado:</label>
                            <select name="Estado" value={formData.Estado} onChange={onChange} style={styles.select}>
                                {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {/* CAMPO: Descripción */}
                    <textarea name="Descripcion" value={formData.Descripcion} onChange={onChange} placeholder="Descripción detallada del artículo" required rows="4" style={{...styles.input, resize: 'vertical'}} />
                    
                    {/* CAMPO: Ubicación */}
                    <input type="text" name="Ubicacion" value={formData.Ubicacion} onChange={onChange} placeholder="Ubicación (Ciudad/Barrio)" required style={styles.input} />

                    <button type="submit" style={styles.button}>
                        Publicar Artículo
                    </button>
                </form>

            </div>
        </div>
    );
};

// --- Estilos Consistentes con la Autenticación ---
const styles = {
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start', // Centrado arriba para formularios largos
        minHeight: '100vh',
        backgroundColor: '#f0f2f5', 
        padding: '40px 0',
    },
    card: {
        width: '100%',
        maxWidth: '700px', // Mayor ancho para más campos
        padding: '40px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', 
        textAlign: 'center',
    },
    header: {
        marginBottom: '30px',
    },
    logo: {
        width: '60px',
        height: '60px',
        marginBottom: '10px',
        borderRadius: '50%', 
        objectFit: 'cover',
    },
    title: {
        fontSize: '28px',
        color: '#333',
        margin: '0',
    },
    subtitle: {
        fontSize: '16px',
        color: '#666',
        marginTop: '5px',
        marginBottom: '20px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        marginBottom: '15px',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '16px',
    },
    fileLabel: {
        textAlign: 'left',
        marginBottom: '5px',
        fontSize: '14px',
        color: '#555',
        fontWeight: 'bold',
    },
    label: {
        textAlign: 'left',
        marginBottom: '5px',
        fontSize: '14px',
        color: '#555',
        fontWeight: 'bold',
        display: 'block',
    },
    select: {
        marginBottom: '15px',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '16px',
        width: '100%',
        backgroundColor: 'white',
    },
    button: {
        padding: '15px',
        backgroundColor: '#007bff', // Azul para el botón de acción
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '20px',
    },
    row: {
        display: 'flex',
        gap: '20px',
        marginBottom: '15px',
    },
    col: {
        flex: 1,
        textAlign: 'left',
    }
};

export default CrearProductoForm;