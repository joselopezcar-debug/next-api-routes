'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Book {
  id: string;
  title: string;
  genre?: string;
  publishedYear?: number;
  pages?: number;
  isbn?: string;
  author: { id: string; name: string };
}

interface Author {
  id: string;
  name: string;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros y paginación
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Formulario de creación/edición
  const [bookForm, setBookForm] = useState({
    title: '',
    description: '',
    isbn: '',
    publishedYear: '',
    genre: '',
    pages: '',
    authorId: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadAuthors = async () => {
    const res = await fetch('/api/authors');
    if (res.ok) setAuthors(await res.json());
  };

  const fetchBooks = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      genre,
      authorName,
      sortBy,
      order,
      page: page.toString(),
      limit: '6'
    });

    const res = await fetch(`/api/books/search?${params}`);
    if (res.ok) {
      const result = await res.json();
      setBooks(result.data);
      setPagination(result.pagination);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [search, genre, authorName, sortBy, order, page]);

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/books/${editingId}` : '/api/books';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookForm)
    });

    if (res.ok) {
      setBookForm({ title: '', description: '', isbn: '', publishedYear: '', genre: '', pages: '', authorId: '' });
      setEditingId(null);
      fetchBooks();
    } else {
      const err = await res.json();
      alert(err.error || 'Error al procesar el libro');
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('¿Eliminar libro?')) return;
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
    if (res.ok) fetchBooks();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold">Catálogo de Libros</h1>
        <Link href="/" className="bg-gray-600 text-white px-4 py-2 rounded">
          Volver a Autores
        </Link>
      </div>

      {/* Formulario Libro */}
      <form onSubmit={handleBookSubmit} className="bg-slate-50 p-6 rounded-lg border grid grid-cols-1 md:grid-cols-3 gap-4">
        <h2 className="md:col-span-3 text-lg font-bold">{editingId ? 'Editar Libro' : 'Registrar Nuevo Libro'}</h2>
        <input
          type="text"
          placeholder="Título *"
          required
          className="p-2 border rounded"
          value={bookForm.title}
          onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
        />
        <select
          required
          className="p-2 border rounded"
          value={bookForm.authorId}
          onChange={(e) => setBookForm({ ...bookForm, authorId: e.target.value })}
        >
          <option value="">Seleccionar Autor *</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Género"
          className="p-2 border rounded"
          value={bookForm.genre}
          onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
        />
        <input
          type="text"
          placeholder="ISBN"
          className="p-2 border rounded"
          value={bookForm.isbn}
          onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
        />
        <input
          type="number"
          placeholder="Año de publicación"
          className="p-2 border rounded"
          value={bookForm.publishedYear}
          onChange={(e) => setBookForm({ ...bookForm, publishedYear: e.target.value })}
        />
        <input
          type="number"
          placeholder="Páginas"
          className="p-2 border rounded"
          value={bookForm.pages}
          onChange={(e) => setBookForm({ ...bookForm, pages: e.target.value })}
        />
        <button type="submit" className="md:col-span-3 bg-blue-600 text-white py-2 rounded font-semibold">
          {editingId ? 'Actualizar Libro' : 'Guardar Libro'}
        </button>
      </form>

      {/* Controles de Búsqueda y Filtros */}
      <div className="bg-white p-4 border rounded shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-700">Filtros y Búsqueda Avanzada</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Buscar por título..."
            className="p-2 border rounded"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <input
            type="text"
            placeholder="Filtrar por género..."
            className="p-2 border rounded"
            value={genre}
            onChange={(e) => { setGenre(e.target.value); setPage(1); }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre autor..."
            className="p-2 border rounded"
            value={authorName}
            onChange={(e) => { setAuthorName(e.target.value); setPage(1); }}
          />
          <select
            className="p-2 border rounded"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Ordenar por Fecha</option>
            <option value="title">Ordenar por Título</option>
            <option value="publishedYear">Ordenar por Año</option>
          </select>
        </div>
      </div>

      {/* Resultados */}
      {loading ? (
        <p className="text-center">Buscando libros...</p>
      ) : (
        <div>
          <p className="text-sm text-gray-500 mb-2">Total encontrados: {pagination.total}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {books.map((b) => (
              <div key={b.id} className="border p-4 rounded bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-lg">{b.title}</h4>
                  <p className="text-xs text-indigo-600 font-semibold">{b.author?.name}</p>
                  <p className="text-sm text-gray-600">Género: {b.genre || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Año: {b.publishedYear || 'N/A'} | Páginas: {b.pages || 'N/A'}</p>
                </div>
                <div className="flex gap-2 mt-4 pt-2 border-t">
                  <button onClick={() => handleDeleteBook(b.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span>Página {page} de {pagination.totalPages || 1}</span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}