import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreatePageSchema } from '@/lib/validations';
import { 
  createApiResponse, 
  requireAuth, 
  validateInput, 
  ApiErrors,
  createAuditLog 
} from '@/lib/api';

/**
 * POST /api/pages
 * Create a new Page
 * 
 * Fase 1A: Qualsiasi utente autenticato può creare una Page
 * La capacità di creare eventi dipende dal tipo Page (VENUE/ORG/FESTIVAL),
 * non dal ruolo globale User.
 */
export async function POST(req: NextRequest) {
  const { error: authError, user } = await requireAuth();
  if (authError) return authError;

  try {
    const body = await req.json();
    
    const { data: validatedData, error } = validateInput(CreatePageSchema, body);
    if (error) return error;

    const pageData = validatedData!;

    // Check if slug is already taken
    const existingPage = await prisma.page.findUnique({
      where: { slug: pageData.slug },
    });

    if (existingPage) {
      return createApiResponse(
        undefined, 
        'Questo slug è già utilizzato da un\'altra Page', 
        409
      );
    }

    // Create Page
    const page = await prisma.page.create({
      data: {
        type: pageData.type,
        name: pageData.name,
        slug: pageData.slug,
        ownerId: user.id, // Auto-assign owner
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Audit log
    await createAuditLog(
      user.id,
      'page.create',
      'Page',
      page.id,
      { 
        type: page.type,
        name: page.name,
        slug: page.slug,
      }
    );

    return createApiResponse(page, 'Page creata con successo', 201);
  } catch (error) {
    console.error('Page creation error:', error);
    return ApiErrors.internal('Failed to create page');
  }
}
