import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/admin/users/[userId]
 * Elimina un utente (solo ADMIN)
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    // Verifica che l'utente esista
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Non permettere di eliminare altri ADMIN
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Non puoi eliminare un altro amministratore' },
        { status: 403 }
      );
    }

    // Elimina l'utente (CASCADE eliminerà automaticamente i dati correlati)
    await prisma.user.delete({
      where: { id: userId },
    });

    console.log('[Admin] User deleted:', user.email, 'by:', session.user.email);

    return NextResponse.json({
      success: true,
      message: `Utente ${user.email} eliminato con successo`,
    });

  } catch (error) {
    console.error('[Admin] Error deleting user:', error);
    
    return NextResponse.json(
      { error: 'Errore durante l\'eliminazione dell\'utente' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/users/[userId]
 * Ottieni dettagli utente (solo ADMIN)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            eventsCreated: true,
            ticketsOwned: true,
            feedItems: true,
            feedComments: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('[Admin] Error fetching user:', error);
    
    return NextResponse.json(
      { error: 'Errore durante il recupero dei dati' },
      { status: 500 }
    );
  }
}
