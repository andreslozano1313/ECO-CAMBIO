import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet'; 
import { useNavigate } from 'react-router-dom';

// Icono por defecto (necesario en react-leaflet)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_URL = 'http://localhost:5000/api/reportes';

// Componente hijo que maneja la interacción del mapa
const LocationMarker = ({ setLocation }) => {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setLocation({ lat, lng });
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return null;
};


const ReporteForm = () => {
    const [descripcion, setDescripcion] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [location, setLocation] = useState(null); // {lat, lng}
    
    const REAL_TOKEN = localStorage.getItem('userToken'); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!descripcion || !location) {
            Swal.fire('Error', 'Debes ingresar una descripción y marcar la ubicación en el mapa.', 'warning');
            return;
        }
        if (!REAL_TOKEN) {
            navigate('/login');
            return;
        }

        const formData = new FormData();
        formData.append('descripcion', descripcion);
        formData.append('latitud', location.lat);
        formData.append('longitud', location.lng);
        if (archivo) {
            formData.append('foto', archivo);
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${REAL_TOKEN}`,
                },
            };
            
            await axios.post(API_URL, formData, config);

            Swal.fire(
                '¡Reporte Enviado!',
                'Gracias por tu reporte ciudadano. Tu acción ha sido registrada.',
                'success'
            );
            
            // Limpiar formulario y estado
            setDescripcion('');
            setArchivo(null);
            setLocation(null);

        } catch (error) {
            console.error('Error al crear reporte:', error);
            Swal.fire(
                'Error de Envío',
                error.response?.data?.message || 'Error desconocido al enviar el reporte.',
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
                    <h2 style={styles.title}>Reporte Ciudadano</h2>
                    <p style={styles.subtitle}>Marca la ubicación y describe un problema ambiental en tu comunidad.</p>
                </div>
                
                <form onSubmit={handleSubmit} style={styles.form}>
                    
                    {/* MAPA */}
                    <div style={styles.mapTitle}>1. Ubicación del Problema:</div>
                    <div style={styles.mapContainer}>
                        <MapContainer 
                            center={[6.2442, -75.5812]} // Coordenadas de ejemplo
                            zoom={13} 
                            scrollWheelZoom={false}
                            style={styles.map}
                        >
                            <TileLayer
                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            
                            <LocationMarker setLocation={setLocation} />

                            {location && (
                                <Marker position={[location.lat, location.lng]} />
                            )}
                        </MapContainer>
                    </div>
                    
                    {/* COORDENADAS */}
                    <div style={styles.coordDisplay}>
                        <label>Coordenadas:</label>
                        <input 
                            type="text" 
                            value={location ? `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}` : 'Haz clic en el mapa para seleccionar...'} 
                            readOnly 
                            style={styles.coordInput}
                        />
                    </div>
                    
                    {/* DESCRIPCIÓN */}
                    <label htmlFor="descripcion" style={styles.label}>2. Descripción Detallada:</label>
                    <textarea
                        id="descripcion"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Ejemplo: Vertido de escombros y basura en la quebrada."
                        required
                        rows="4"
                        style={styles.textarea}
                    />
                    
                    {/* FOTO */}
                    <label htmlFor="foto" style={styles.label}>3. Adjuntar Foto (Opcional):</label>
                    <input 
                        type="file" 
                        id="foto"
                        onChange={(e) => setArchivo(e.target.files[0])}
                        style={styles.fileInput}
                    />
                
                    <button type="submit" style={styles.button}>
                        Enviar Reporte
                    </button>
                </form>

            </div>
        </div>
    );
};

// --- Estilos Consistentes ---
const styles = {
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5', 
        padding: '40px 0',
    },
    card: {
        width: '100%',
        maxWidth: '800px', 
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
        textAlign: 'left',
    },
    // MAPA
    mapTitle: {
        fontSize: '1.2em',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#333',
        borderBottom: '1px solid #eee',
        paddingBottom: '5px',
    },
    mapContainer: {
        height: '350px', 
        width: '100%',
        marginBottom: '20px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
    },
    map: {
        height: '100%',
        width: '100%',
    },
    // INPUTS
    label: {
        marginBottom: '5px',
        fontSize: '15px',
        color: '#555',
        fontWeight: 'bold',
        display: 'block',
    },
    textarea: {
        marginBottom: '20px',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '16px',
        resize: 'vertical',
    },
    fileInput: {
        marginBottom: '20px',
        padding: '12px 0',
    },
    coordDisplay: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        gap: '10px',
    },
    coordInput: {
        flexGrow: 1,
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '16px',
        backgroundColor: '#f9f9f9',
    },
    button: {
        padding: '15px',
        backgroundColor: '#f0ad4e', // Color de Alerta/Reporte
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.3s',
    },
};

export default ReporteForm;