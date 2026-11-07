'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Author {
  id: string;
  name: string;
  email: string;
  bio?: string;
  nationality?: string;
  birthYear?: number;
  _count?: { books: number };
}

export default function Dashboard() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', nationality: '', birthYear: '', bio: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAuthors = async () => {
    setLoading(true);
    const res = await fetch('/api/authors');
    if (res.ok) {
      const data = await res.json();
      setAuthors(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/authors/${editingId}` : '/api/authors';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      setForm({ name: '', email: '', nationality: '', birthYear: '', bio: '' });
      setEditingId(null);
      fetchAuthors();
    } else {
      const err = await res.json();
      alert(err.error || 'Error en la operación');
    }
  };

  const handleEdit = (author: Author) => {
    setEditingId(author.id);
    setForm({
      name: author.name,
      email: author.email,
      nationality: author.nationality || '',
      birthYear: author.birthYear ? author.birthYear.toString() : '',
      bio: author.bio || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este autor?')) return;
    const res = await fetch(`/api/authors/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAuthors();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-800">Sistema de Biblioteca</h1>
        <Link href="/books" className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">
          Ir a Búsqueda de Libros
        </Link>
      </header>

      {/* Formulario */}
      <section className="bg-slate-50 p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editar Autor' : 'Crear Nuevo Autor'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre *"
            required
            className="p-2 border rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email *"
            required
            className="p-2 border rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Nacionalidad"
            className="p-2 border rounded"
            value={form.nationality}
            onChange={(e) => setForm({ ...form, nationality: e.target.value })}
          />
          <input
            type="number"
            placeholder="Año de nacimiento"
            className="p-2 border rounded"
            value={form.birthYear}
            onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
          />
          <textarea
            placeholder="Biografía"
            className="p-2 border rounded md:col-span-2"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {editingId ? 'Guardar Cambios' : 'Registrar Autor'}
            </button>
            {editingId && (
              <button
                type="button"
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: '', email: '', nationality: '', birthYear: '', bio: '' });
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Lista de Autores */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Autores Registrados ({authors.length})</h2>
        {loading ? (
          <p>Cargando autores...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {authors.map((author) => (
              <div key={author.id} className="border p-4 rounded-lg bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{author.name}</h3>
                  <p className="text-sm text-gray-600">{author.email}</p>
                  <p className="text-xs text-gray-500 mt-1">{author.nationality || 'Nacionalidad N/A'}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                    Libros: {author._count?.books || 0}
                  </span>
                </div>
                <div className="mt-4 flex gap-2 pt-2 border-t">
                  <Link href={`/authors/${author.id}`} className="text-xs bg-emerald-600 text-white px-2 py-1 rounded">
                    Detalle & Stats
                  </Link>
                  <button onClick={() => handleEdit(author)} className="text-xs bg-amber-500 text-white px-2 py-1 rounded">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(author.id)} className="text-xs bg-rose-600 text-white px-2 py-1 rounded">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}