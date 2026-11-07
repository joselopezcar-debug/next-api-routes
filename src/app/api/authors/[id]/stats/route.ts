import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const author = await prisma.author.findUnique({
      where: { id },
      include: { books: true }
    });

    if (!author) {
      return NextResponse.json({ error: 'Autor no encontrado' }, { status: 404 });
    }

    const books = author.books;
    const totalBooks = books.length;

    if (totalBooks === 0) {
      return NextResponse.json({
        authorId: author.id,
        authorName: author.name,
        totalBooks: 0,
        firstBook: null,
        latestBook: null,
        averagePages: 0,
        genres: [],
        longestBook: null,
        shortestBook: null
      });
    }

    const booksWithYear = books.filter(b => b.publishedYear !== null);
    booksWithYear.sort((a, b) => (a.publishedYear || 0) - (b.publishedYear || 0));

    const firstBook = booksWithYear.length > 0 
      ? { title: booksWithYear[0].title, year: booksWithYear[0].publishedYear }
      : null;

    const latestBook = booksWithYear.length > 0 
      ? { title: booksWithYear[booksWithYear.length - 1].title, year: booksWithYear[booksWithYear.length - 1].publishedYear }
      : null;

    const booksWithPages = books.filter(b => b.pages !== null && b.pages > 0);
    const sumPages = booksWithPages.reduce((acc, b) => acc + (b.pages || 0), 0);
    const averagePages = booksWithPages.length > 0 ? Math.round(sumPages / booksWithPages.length) : 0;

    const genres = Array.from(new Set(books.map(b => b.genre).filter(Boolean))) as string[];

    let longestBook = null;
    let shortestBook = null;

    if (booksWithPages.length > 0) {
      const sortedByPages = [...booksWithPages].sort((a, b) => (a.pages || 0) - (b.pages || 0));
      shortestBook = { title: sortedByPages[0].title, pages: sortedByPages[0].pages };
      longestBook = { title: sortedByPages[sortedByPages.length - 1].title, pages: sortedByPages[sortedByPages.length - 1].pages };
    }

    return NextResponse.json({
      authorId: author.id,
      authorName: author.name,
      totalBooks,
      firstBook,
      latestBook,
      averagePages,
      genres,
      longestBook,
      shortestBook
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener las estadísticas del autor' }, { status: 500 });
  }
}