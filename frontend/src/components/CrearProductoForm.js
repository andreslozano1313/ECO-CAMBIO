import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

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

    // Asegura que el campo Precio sea requerido solo si el Tipo es Venta
    const handleTipoChange = (e) => {
        const newTipo = e.target.value;
        setFormData({ 
            ...formData, 
            Tipo: newTipo, 
            Precio: newTipo === 'Donación' ? 0 : formData.Precio // Reinicia precio si es donación
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
            data.append('foto', foto); // Clave 'foto' debe coincidir con Multer
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${REAL_TOKEN}`,
                },
            };
            
            await axios.post(API_URL, data, config);

            Swal.fire('¡Publicado!', 'Tu artículo se ha publicado en el Marketplace.', 'success');
            navigate('/marketplace'); // Redirige al catálogo

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
        <div style={styles.container}>
            <h2>Publicar Artículo para Eco-Cambio</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                
                {/* Nombre del Producto */}
                <input type="text" name="Nombre_Producto" value={formData.Nombre_Producto} onChange={onChange} placeholder="Nombre del Artículo" required style={styles.input} />

                {/* Foto */}
                <label>Foto del Artículo:</label>
                <input type="file" onChange={(e) => setFoto(e.target.files[0])} style={styles.input} />

                {/* Tipo (Venta/Donación) */}
                <label>Tipo de Transacción:</label>
                <select name="Tipo" value={formData.Tipo} onChange={handleTipoChange} style={styles.input}>
                    <option value="Venta">Venta</option>
                    <option value="Donación">Donación</option>
                </select>

                {/* Precio (Solo si es Venta) */}
                {formData.Tipo === 'Venta' && (
                    <input type="number" name="Precio" value={formData.Precio} onChange={onChange} placeholder="Precio ($)" required style={styles.input} min="0.01" step="0.01" />
                )}

                {/* Categoría */}
                <label>Categoría:</label>
                <select name="Categoria" value={formData.Categoria} onChange={onChange} style={styles.input}>
                    {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                {/* Estado */}
                <label>Estado del Artículo:</label>
                <select name="Estado" value={formData.Estado} onChange={onChange} style={styles.input}>
                    {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                </select>
                
                {/* Descripción */}
                <textarea name="Descripcion" value={formData.Descripcion} onChange={onChange} placeholder="Descripción detallada del artículo" required rows="4" style={styles.input} />
                
                {/* Ubicación */}
                <input type="text" name="Ubicacion" value={formData.Ubicacion} onChange={onChange} placeholder="Ubicación (Ciudad/Barrio)" required style={styles.input} />

                <button type="submit" style={styles.button}>Publicar Artículo</button>
            </form>
        </div>
    );
};

// Estilos básicos
const styles = {
    container: { maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' },
    form: { display: 'flex', flexDirection: 'column' },
    input: { marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' },
    button: { padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    // ... otros estilos ...
};

export default CrearProductoForm;