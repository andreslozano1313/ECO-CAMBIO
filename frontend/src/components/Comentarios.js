import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import API_BASE_URL from '../config';

const Comentarios = ({ publicacionId }) => {
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState('');
    const [loading, setLoading] = useState(true);

    const REAL_TOKEN = localStorage.getItem('userToken');
    const API_URL = `${API_BASE_URL}/publicaciones/${publicacionId}/comentarios`;


    const getConfig = useCallback(() => ({
        headers: { Authorization: `Bearer ${REAL_TOKEN}` },
    }), [REAL_TOKEN]);

    // Función para obtener comentarios
    const fetchComentarios = useCallback(async () => {
        if (!REAL_TOKEN) return;
        try {
            const response = await axios.get(API_URL, getConfig());
            setComentarios(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error al cargar comentarios:", error);
            setLoading(false);
        }
    }, [API_URL, getConfig, REAL_TOKEN]);

    // Función para enviar nuevo comentario
    const handlePostComentario = async (e) => {
        e.preventDefault();
        if (!nuevoComentario.trim()) return;

        try {
            await axios.post(API_URL, { texto: nuevoComentario }, getConfig());
            setNuevoComentario('');
            // Recargar la lista de comentarios
            fetchComentarios(); 
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Fallo al publicar el comentario.', 'error');
        }
    };

    useEffect(() => {
        if (publicacionId) {
            fetchComentarios();
        }
    }, [publicacionId, fetchComentarios]);

    if (loading) return <div>Cargando comentarios...</div>;

    return (
        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
            <h4>Comentarios ({comentarios.length})</h4>
            {comentarios.map((c) => (
                <div key={c._id} style={{ borderBottom: '1px dotted #ccc', padding: '5px 0' }}>
                    <strong>{c.autor.nombres}</strong>: {c.texto}
                    <small style={{ float: 'right', color: '#888' }}>{new Date(c.createdAt).toLocaleTimeString()}</small>
                </div>
            ))}
            
            {/* Formulario para Comentar */}
            <form onSubmit={handlePostComentario} style={{ marginTop: '10px' }}>
                <input
                    type="text"
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe tu comentario..."
                    required
                    style={{ width: '80%', padding: '8px', marginRight: '10px' }}
                />
                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#5cb85c', color: 'white', border: 'none' }}>
                    Comentar
                </button>
            </form>
        </div>
    );
};

export default Comentarios;