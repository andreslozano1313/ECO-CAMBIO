import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'; 
import styled from 'styled-components';
import Comentarios from './Comentarios';
import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/publicaciones`;


const PublicacionesList = () => {
    const [publicaciones, setPublicaciones] = useState([]);
    const [comentarioActivoId, setComentarioActivoId] = useState(null); // <-- Estado para el Comentario Activo
    const [loading, setLoading] = useState(true);

    const REAL_TOKEN = localStorage.getItem('userToken'); 
    
    // Función para obtener la configuración de Headers
    const getConfig = () => ({
        headers: {
            Authorization: `Bearer ${REAL_TOKEN}`,
        },
    });


    // FUNCIÓN PARA CONSUMIR LA API
    const fetchPublicaciones = useCallback(async () => {
        if (!REAL_TOKEN) {
            setLoading(false);
            Swal.fire('Error', 'Debe iniciar sesión para ver las publicaciones.', 'error');
            return;
        }

        try {
            const response = await axios.get(API_URL, getConfig());
            setPublicaciones(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener las publicaciones:", error);
            setLoading(false);
            Swal.fire(
                'Error de API',
                error.response?.data?.message || 'No se pudieron cargar las publicaciones. ¿Backend corriendo?',
                'error'
            );
        }
    }, [REAL_TOKEN]);


    // FUNCIÓN PARA ELIMINAR
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/${id}`, getConfig()); 

                Swal.fire(
                    '¡Eliminado!',
                    'La publicación ha sido eliminada.',
                    'success'
                );
                
                fetchPublicaciones(); 

            } catch (error) {
                console.error("Error al eliminar la publicación:", error);
                const errorMessage = error.response?.data?.message || 'Error desconocido al eliminar.';
                Swal.fire(
                    'Error',
                    errorMessage,
                    'error'
                );
            }
        }
    };
    

    // DEFINICIÓN DE COLUMNAS (Añadimos la columna de Comentarios)
    const columns = [
        { name: 'Autor', selector: row => row.autor.nombres, sortable: true },
        { name: 'Acción Ecológica', selector: row => row.texto, sortable: false, wrap: true },
        { name: 'Puntos', selector: row => row.puntosOtorgados, sortable: true },
        { name: 'Fecha', selector: row => new Date(row.createdAt).toLocaleDateString(), sortable: true },
        
        {
            name: 'Interacción',
            cell: row => (
                <button 
                    // Al hacer clic, alterna el ID del comentario activo. Si es el mismo, lo oculta (null).
                    onClick={() => setComentarioActivoId(comentarioActivoId === row._id ? null : row._id)} 
                    style={{ padding: '5px 10px', backgroundColor: '#337ab7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {comentarioActivoId === row._id ? 'Ocultar Comentarios' : 'Ver Comentarios'}
                </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
        // -->
        {
            name: 'Acciones',
            cell: row => (
                <button 
                    onClick={() => handleDelete(row._id)} 
                    style={{ 
                        backgroundColor: '#dc3545', color: 'white', border: 'none', 
                        padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' 
                    }}
                >
                    Eliminar
                </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];


    // EFECTO PARA CARGAR DATOS
    useEffect(() => {
        fetchPublicaciones();
    }, [fetchPublicaciones]);

    if (loading) {
        return <div>Cargando publicaciones...</div>;
    }

    if (!REAL_TOKEN) {
        return <div>Por favor, inicia sesión para ver el feed.</div>;
    }


    return (
        <div style={{ padding: '20px' }}>
            <h2>Feed de Acciones Ecológicas</h2>
            <DataTable
                title="Publicaciones Recientes"
                columns={columns}
                data={publicaciones}
                pagination
                highlightOnHover
                pointerOnHover
                responsive
            />
            
            {/* INTEGRACIÓN FINAL: Muestra el componente de Comentarios si hay un ID activo */}
            {comentarioActivoId && (
                <Comentarios publicacionId={comentarioActivoId} /> 
            )}
        </div>
    );
};

export default PublicacionesList;