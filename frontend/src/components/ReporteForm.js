import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet'; // Para acceder al ícono por defecto
import { useNavigate } from 'react-router-dom'; // Para redireccionar (si estuviera enrutado)

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
            // Al hacer clic, actualiza la ubicación
            const { lat, lng } = e.latlng;
            setLocation({ lat, lng });
            map.flyTo(e.latlng, map.getZoom()); // Centra el mapa
        },
    });

    return null;
};


const ReporteForm = () => {
    const [descripcion, setDescripcion] = useState('');
    const [archivo, setArchivo] = useState(null);
    const [location, setLocation] = useState(null); // {lat, lng}
    
    // IMPORTANTE: REEMPLAZA ESTO CON UN TOKEN VÁLIDO
    const MOCK_TOKEN = 'TU_TOKEN_JWT_DE_PRUEBA'; 

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!descripcion || !location) {
            Swal.fire('Error', 'Debes ingresar una descripción y marcar la ubicación en el mapa.', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('descripcion', descripcion);
        formData.append('latitud', location.lat);
        formData.append('longitud', location.lng);
        if (archivo) {
            formData.append('foto', archivo); // Clave 'foto' debe coincidir con Multer
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${MOCK_TOKEN}`,
                    // El header 'Content-Type': 'multipart/form-data' es establecido automáticamente por FormData
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
        <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Reporte Ciudadano: Problema Ambiental</h2>
            <p>Haz clic en el mapa para marcar la ubicación exacta del problema.</p>
            
            {/* Contenedor del Mapa */}
            <div className="map-container">
                <MapContainer 
                    center={[6.2442, -75.5812]} // Coordenadas de ejemplo (Medellín)
                    zoom={13} 
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Componente para manejar el clic y actualizar el estado */}
                    <LocationMarker setLocation={setLocation} />

                    {/* Marcador en la ubicación seleccionada */}
                    {location && (
                        <Marker position={[location.lat, location.lng]} />
                    )}
                </MapContainer>
            </div>
            
            {/* Formulario */}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Ubicación Seleccionada:</label>
                    <input 
                        type="text" 
                        value={location ? `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}` : 'Haz clic en el mapa...'} 
                        readOnly 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="descripcion">Descripción del Problema:</label>
                    <textarea
                        id="descripcion"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        required
                        rows="4"
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="foto">Adjuntar Foto (Opcional):</label>
                    <input 
                        type="file" 
                        id="foto"
                        onChange={(e) => setArchivo(e.target.files[0])}
                    />
                </div>
                
                <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Enviar Reporte
                </button>
            </form>
        </div>
    );
};

export default ReporteForm;