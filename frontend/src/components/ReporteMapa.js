import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

// Icono por defecto (necesario en react-leaflet)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_URL = `${API_BASE_URL}/reportes`;

const ReporteMapa = () => {
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const REAL_TOKEN = localStorage.getItem('userToken');
    
    // Obtener ID del usuario autenticado de forma simple para la UI (No es totalmente seguro, pero funciona para la lógica del frontend)
    const loggedInUserId = REAL_TOKEN ? JSON.parse(atob(REAL_TOKEN.split('.')[1])).id : null; 
    
    // FUNCIÓN PARA CARGAR REPORTES (USADA EN ELIMINACIÓN)
    const fetchReportes = useCallback(async () => {
        if (!REAL_TOKEN) {
            navigate('/login');
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${REAL_TOKEN}` },
            };
            // Consumimos el endpoint que trae todos los reportes
            const response = await axios.get(API_URL, config);
            setReportes(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener reportes:", error);
            Swal.fire('Error', 'No se pudieron cargar los reportes de incidentes.', 'error');
            setLoading(false);
        }
    }, [REAL_TOKEN, navigate]);

    // 2. FUNCIÓN PARA ELIMINAR EL REPORTE
    const handleEliminarReporte = async (reporteId) => {
        const result = await Swal.fire({
            title: '¿Problema Resuelto?',
            text: "¿Estás seguro de que deseas eliminar este reporte? Solo hazlo si ya fue solucionado.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, Eliminar (Resuelto)'
        });

        if (result.isConfirmed) {
            try {
                const config = { headers: { Authorization: `Bearer ${REAL_TOKEN}` } };
                // Llama a la nueva ruta DELETE /api/reportes/:id
                await axios.delete(`${API_URL}/${reporteId}`, config);
                
                Swal.fire('¡Resuelto!', 'El reporte ha sido eliminado del mapa.', 'success');
                // Recargar el mapa para que el marcador desaparezca
                fetchReportes(); 

            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Fallo al eliminar el reporte.', 'error');
            }
        }
    };


    useEffect(() => {
        fetchReportes();
    }, [fetchReportes]);

    if (loading) return <div style={styles.pageContainer}>Cargando Mapa de Incidentes...</div>;

    const initialPosition = [6.2442, -75.5812]; 

    return (
        <div style={styles.pageContainer}>
            <h2 style={styles.title}>Mapa Comunitario de Incidentes Ambientales ({reportes.length})</h2>
            <p style={styles.subtitle}>Visibilidad Pública: Ubicaciones reportadas por la comunidad.</p>
            
            <div style={styles.mapContainer}>
                <MapContainer 
                    center={initialPosition}
                    zoom={12} 
                    style={styles.map}
                >
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Generar un marcador por cada reporte */}
                    {reportes.map((reporte) => {
                        const [lng, lat] = reporte.ubicacion.coordinates;
                        // Verificar si el usuario actual es el autor del reporte
                        const esAutor = reporte.autor._id === loggedInUserId; 
                        
                        return (
                            <Marker key={reporte._id} position={[lat, lng]}>
                                <Popup>
                                    <div style={styles.popupContent}> 
                                        <strong style={{color: '#dc3545', display: 'block', marginBottom: '5px'}}>INCIDENTE: {reporte.estado}</strong>
                                        
                                        {/* IMAGEN */}
                                        {reporte.urlFoto && (
                                            <img 
                                                src={`http://localhost:5000/${reporte.urlFoto}`} 
                                                alt="Foto del Problema" 
                                                style={styles.popupImage} 
                                            />
                                        )}
                                        {/* DESCRIPCIÓN Y AUTOR */}
                                        <p style={styles.popupText}>
                                            {reporte.descripcion}
                                        </p>
                                        <small>Reportado por: {reporte.autor?.nombres || 'Anónimo'}</small>
                                        
                                        {/* BOTÓN DE ELIMINAR (SOLO VISIBLE PARA EL AUTOR) */}
                                        {esAutor && (
                                            <button
                                                onClick={() => handleEliminarReporte(reporte._id)}
                                                style={styles.deleteButton}
                                            >
                                                ✅ Marcar como Resuelto y Eliminar
                                            </button>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
            
            <p style={{textAlign: 'center', color: '#555', marginTop: '20px'}}>
                **¡La comunidad y las autoridades pueden usar este mapa para visualizar el problema!**
            </p>
        </div>
    );
};

// Estilos consistentes con la aplicación
const styles = {
    pageContainer: {
        padding: '20px 40px',
        backgroundColor: '#f0f2f5',
        minHeight: 'calc(100vh - 70px)',
    },
    title: { textAlign: 'center', color: '#333', marginBottom: '5px' },
    subtitle: { textAlign: 'center', color: '#666', marginBottom: '20px' },
    mapContainer: {
        height: '60vh',
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        border: '1px solid #ddd',
    },
    map: {
        height: '100%',
        width: '100%',
    },
   
    popupContent: {
        width: '200px',
        maxHeight: '350px',
        overflowY: 'auto',
        fontSize: '14px',
    },
    popupImage: {
        width: '100%',
        height: 'auto',
        maxHeight: '150px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginTop: '5px',
        marginBottom: '5px',
    },
    popupText: {
        margin: '0 0 5px 0',
        lineHeight: '1.4',
    },
    // --- ESTILO NUEVO PARA EL BOTÓN DE ELIMINAR ---
    deleteButton: {
        marginTop: '10px',
        padding: '5px 10px',
        backgroundColor: '#4CAF50', 
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
        fontWeight: 'bold',
    },
};

export default ReporteMapa;