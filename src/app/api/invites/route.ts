import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateInviteLinkSchema } from '@/lib/validations';
import { 
  createApiResponse, 
  requireAuth, 
  validateInput, 
  ApiErrors,
  createAuditLog 
} from '@/lib/api';

/**
 * POST /api/invites
 * Create a new invite link
 */
export async function POST(req: NextRequest) {
  const { error: authError, user } = await requireAuth(['PR', 'ORGANIZER', 'ADMIN']);
  if (authError) return authError;

  try {
    const body = await req.json();
    
    const { data: validatedData, error } = validateInput(CreateInviteLinkSchema, body);
    if (error) return error;

    const { eventId, prProfileId, maxUses, expiresAt, utmSource, utmMedium, utmCampaign } = validatedData!;

    // Validate event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        assignments: {
          include: {
            prProfile: { include: { user: true } },
          },
        },
      },
    });

    if (!event) {
      return ApiErrors.notFound('Event');
    }

    // Check permissions
    const isOwner = event.createdByUserId === user.id;
    const isAssignedPR = event.assignments.some(
      (assignment: any) => assignment.prProfile.user.id === user.id
    );

    if (!isOwner && !isAssignedPR && user.role !== 'ADMIN') {
      return ApiErrors.forbidden();
    }

    // Validate PR profile if provided
    let prProfile = null;
    if (prProfileId) {
      prProfile = await prisma.pRProfile.findUnique({
        where: { id: prProfileId },
        include: { user: true },
      });

      if (!prProfile) {
        return ApiErrors.notFound('PR Profile');
      }

      // Check if PR is assigned to this event
      const assignment = event.assignments.find(
        (a: any) => a.prProfileId === prProfileId
      );

      if (!assignment && user.role !== 'ADMIN') {
        return ApiErrors.badRequest('PR is not assigned to this event');
      }
    }

    // Generate unique slug
    const baseSlug = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const slug = baseSlug.substring(0, 50);

    // Validate expiration date
    if (expiresAt) {
      const expirationDate = new Date(expiresAt);
      if (expirationDate <= new Date()) {
        return ApiErrors.badRequest('Expiration date must be in the future');
      }
      if (expirationDate > event.dateStart) {
        return ApiErrors.badRequest('Expiration date cannot be after event start');
      }
    }

    const inviteLink = await prisma.inviteLink.create({
      data: {
        createdByUserId: user.id,
        eventId,
        prProfileId,
        slug,
        maxUses,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        utmSource,
        utmMedium,
        utmCampaign,
      },
      include: {
        event: {
          select: { id: true, title: true, dateStart: true },
        },
        prProfile: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Generate full URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const fullUrl = `${baseUrl}/invite/${slug}`;

    // Audit log
    await createAuditLog(
      user.id,
      'invite.create',
      'InviteLink',
      inviteLink.id,
      { 
        slug,
        eventId,
        prProfileId: prProfile?.id 
      }
    );

    return createApiResponse({
      ...inviteLink,
      url: fullUrl,
    }, undefined, 201);

  } catch (error) {
    console.error('Invite link creation error:', error);
    return ApiErrors.internal('Failed to create invite link');
  }
}