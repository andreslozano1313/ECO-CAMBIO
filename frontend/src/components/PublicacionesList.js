import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2'; 
import styled from 'styled-components';


const API_URL = 'http://localhost:5000/api/publicaciones';

// 1. Definición de las Columnas para la DataTable
const columns = [
    {
        name: 'Autor',
        selector: row => row.autor.nombres,
        sortable: true,
    },
    {
        name: 'Acción Ecológica',
        selector: row => row.texto,
        sortable: false,
        wrap: true, 
    },
    {
        name: 'Puntos',
        selector: row => row.puntosOtorgados,
        sortable: true,
    },
    {
        name: 'Fecha',
        selector: row => new Date(row.createdAt).toLocaleDateString(),
        sortable: true,
    },
    {
        name: 'Acciones',
        cell: row => (
            <button 
                onClick={() => handleDelete(row._id)} //función de SweetAlert/Eliminar
                className="btn btn-danger btn-sm" 
            >
                Eliminar
            </button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
    },
];

const handleDelete = async (id) => {
    // SweetAlert para confirmar la acción Punto de Evaluación
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
        // Lógica de eliminación...
        Swal.fire(
            '¡Eliminado!',
            'La publicación ha sido eliminada.',
            'success'
        );
        
    }
};


const PublicacionesList = () => {
    const [publicaciones, setPublicaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmFjMTM2MjUzMDY2MDgxYTk1OWI1ZiIsImlhdCI6MTc2MTI2MzkyNiwiZXhwIjoxNzYzODU1OTI2fQ.eHvQ7YKsqARzCyA1PvWrxXccbpURo3zDxOE061_KqFw'; 
    
    // 2. Función para Consumir la API
    const fetchPublicaciones = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${MOCK_TOKEN}`, // Enviamos el token para pasar el 'protect'
                },
            };
            const response = await axios.get(API_URL, config);
            setPublicaciones(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener las publicaciones:", error);
            // Uso básico de SweetAlert para manejar errores de API 
            Swal.fire(
                'Error de API',
                'No se pudieron cargar las publicaciones. ¿Está el backend corriendo?',
                'error'
            );
            setLoading(false);
        }
    };

    // 1. FUNCIÓN PARA ELIMINAR
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
                const config = {
                    headers: {
                        Authorization: `Bearer ${MOCK_TOKEN}`,
                    },
                };

                // Llama a la API DELETE del backend
                await axios.delete(`${API_URL}/${id}`, config); 

                // Muestra SweetAlert de éxito
                Swal.fire(
                    '¡Eliminado!',
                    'La publicación ha sido eliminada.',
                    'success'
                );
                
                // Opción 1 (Recomendada): Recarga la lista de publicaciones
                fetchPublicaciones(); 
                

            } catch (error) {
                console.error("Error al eliminar la publicación:", error);
                
                // Manejo de errores de API con SweetAlert
                const errorMessage = error.response?.data?.message || 'Error desconocido al eliminar.';
                Swal.fire(
                    'Error',
                    errorMessage,
                    'error'
                );
            }
        }
    };
    
    const columns = [
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


    // Efecto para cargar los datos al montar el componente
    useEffect(() => {
        fetchPublicaciones();
    }, []);

    if (loading) {
        return <div>Cargando publicaciones...</div>;
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
        </div>
    );
};

export default PublicacionesList;