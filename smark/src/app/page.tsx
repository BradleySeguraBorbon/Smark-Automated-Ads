'use client'
import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);
      console.log(prompt);
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2N2ZmYmQ3MzE0NzRiMmJjYzU4Y2MzZDkiLCJ1c2VybmFtZSI6IlNlYmFzdGlhbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjAyNDc1OSwiZXhwIjoxNzQ2MDI4MzU5fQ.EQpfTIt9DrmyzW6B9w3RcomTAiVKAa2XU8-DCfTiBNM';//localStorage.getItem('token');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
         },
        body: JSON.stringify({ prompt }),
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error en la petición');
      }
      

      const data = await res.json();
      setResponse(data.response);
      console.log(data.response, 'response');
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Chat con AIMLAPI</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="border p-2 mr-2"
          placeholder="Escribe algo..."
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {loading ? 'Cargando...' : 'Enviar'}
        </button>
      </form>
      {response && (
        <div className="mt-4 p-4 border rounded">
          <strong>Respuesta:</strong>
          <p>{JSON.stringify(response, null, 2)}</p>
        </div>
      )}
    </div>
  );
}
