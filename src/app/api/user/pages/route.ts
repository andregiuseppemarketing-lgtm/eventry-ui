import { NextRequest } from 'next/server';
import { getUserEventCreatorPages } from '@/lib/page-permissions';
import { 
  createApiResponse, 
  requireAuth, 
  ApiErrors 
} from '@/lib/api';

/**
 * GET /api/user/pages
 * Get all event-creator Pages owned by authenticated user
 * 
 * Used for Page selector in event creation UI (Step 4)
 * Returns only VENUE, ORGANIZATION, FESTIVAL pages
 */
export async function GET(req: NextRequest) {
  const { error: authError, user } = await requireAuth();
  if (authError) return authError;

  try {
    // Use helper from page-permissions.ts
    const pages = await getUserEventCreatorPages(user.id);

    return createApiResponse({
      pages,
      count: pages.length,
    });
  } catch (error) {
    console.error('User pages fetch error:', error);
    return ApiErrors.internal('Failed to fetch user pages');
  }
}
