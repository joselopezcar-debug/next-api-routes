'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface Stats {
  authorId: string;
  authorName: string;
  totalBooks: number;
  firstBook: { title: string; year: number } | null;
  latestBook: { title: string; year: number } | null;
  averagePages: number;
  genres: string[];
  longestBook: { title: string; pages: number } | null;
  shortestBook: { title: string; pages: number } | null;
}

export default function AuthorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch(`/api/authors/${id}/stats`);
      if (res.ok) {
        setStats(await res.json());
      }
      setLoading(false);
    };
    fetchStats();
  }, [id]);

  if (loading) return <div className="p-6">Cargando estadísticas...</div>;
  if (!stats) return <div className="p-6">Autor no encontrado</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Link href="/" className="text-blue-600 hover:underline">← Volver al Dashboard</Link>
      
      <h1 className="text-3xl font-bold">{stats.authorName}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 p-4 border border-emerald-200 rounded">
          <h3 className="text-gray-600 text-sm">Total Libros</h3>
          <p className="text-2xl font-bold text-emerald-800">{stats.totalBooks}</p>
        </div>
        
        <div className="bg-blue-50 p-4 border border-blue-200 rounded">
          <h3 className="text-gray-600 text-sm">Promedio de Páginas</h3>
          <p className="text-2xl font-bold text-blue-800">{stats.averagePages} págs.</p>
        </div>

        <div className="bg-amber-50 p-4 border border-amber-200 rounded">
          <h3 className="text-gray-600 text-sm">Primer Libro Publicado</h3>
          <p className="font-semibold">{stats.firstBook ? `${stats.firstBook.title} (${stats.firstBook.year})` : 'N/A'}</p>
        </div>

        <div className="bg-purple-50 p-4 border border-purple-200 rounded">
          <h3 className="text-gray-600 text-sm">Último Libro Publicado</h3>
          <p className="font-semibold">{stats.latestBook ? `${stats.latestBook.title} (${stats.latestBook.year})` : 'N/A'}</p>
        </div>

        <div className="bg-indigo-50 p-4 border border-indigo-200 rounded">
          <h3 className="text-gray-600 text-sm">Libro Más Largo</h3>
          <p className="font-semibold">{stats.longestBook ? `${stats.longestBook.title} (${stats.longestBook.pages} págs.)` : 'N/A'}</p>
        </div>

        <div className="bg-rose-50 p-4 border border-rose-200 rounded">
          <h3 className="text-gray-600 text-sm">Libro Más Corto</h3>
          <p className="font-semibold">{stats.shortestBook ? `${stats.shortestBook.title} (${stats.shortestBook.pages} págs.)` : 'N/A'}</p>
        </div>
      </div>

      <div className="bg-white p-4 border rounded">
        <h3 className="font-bold mb-2">Géneros Explorados</h3>
        <div className="flex gap-2 flex-wrap">
          {stats.genres.length > 0 ? (
            stats.genres.map((g) => (
              <span key={g} className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm">{g}</span>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Sin géneros registrados</p>
          )}
        </div>
      </div>
    </div>
  );
}