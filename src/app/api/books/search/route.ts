import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre') || '';
    const authorName = searchParams.get('authorName') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    const validSortFields = ['title', 'publishedYear', 'createdAt'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const where: any = {};

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (genre) {
      where.genre = genre;
    }

    if (authorName) {
      where.author = {
        name: {
          contains: authorName,
          mode: 'insensitive'
        }
      };
    }

    const skip = (page - 1) * limit;

    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [orderByField]: order
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error al realizar la búsqueda de libros' },
      { status: 500 }
    );
  }
}