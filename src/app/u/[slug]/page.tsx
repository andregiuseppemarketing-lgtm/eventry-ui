import { UserProfileClient } from '@/components/profile/user-profile-client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

/**
 * User Profile Page - Sprint 1
 * Integra nuova architettura con ProfileLayout, CTA, Tab e Eventi
 */
export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  return <UserProfileClient slug={slug} currentUserId={currentUserId} />;
}
