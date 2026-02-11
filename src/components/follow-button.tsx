'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FollowButtonProps {
  targetSlug?: string;
  targetId?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  followText?: string;
  unfollowText?: string;
}

export function FollowButton({
  targetSlug,
  targetId,
  className,
  variant = 'default',
  size = 'default',
  showIcon = true,
  followText = 'Segui',
  unfollowText = 'Seguito',
}: FollowButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkFollowStatus = useCallback(async () => {
    try {
      setChecking(true);
      const params = new URLSearchParams();
      if (targetSlug) params.set('targetSlug', targetSlug);
      if (targetId) params.set('targetId', targetId);

      const response = await fetch(`/api/follow?${params}`);
      const data = await response.json();
      setIsFollowing(data.isFollowing || false);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setChecking(false);
    }
  }, [targetSlug, targetId]);

  useEffect(() => {
    if (status === 'authenticated' && (targetSlug || targetId)) {
      checkFollowStatus();
    } else {
      setChecking(false);
    }
  }, [status, targetSlug, targetId, checkFollowStatus]);

  const handleFollow = async () => {
    if (status !== 'authenticated') {
      router.push('/auth/login');
      return;
    }

    try {
      setLoading(true);

      let followingId = targetId;

      // Se abbiamo solo slug, dobbiamo ottenere l'ID
      if (!followingId && targetSlug) {
        const profileRes = await fetch(`/api/user/${targetSlug}`);
        const profileData = await profileRes.json();
        followingId = profileData.id;
      }

      if (!followingId) {
        throw new Error('Target user not found');
      }

      if (isFollowing) {
        // Unfollow
        const response = await fetch('/api/follow', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followingId }),
        });

        if (!response.ok) {
          throw new Error('Failed to unfollow');
        }

        setIsFollowing(false);
      } else {
        // Follow
        const response = await fetch('/api/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followingId }),
        });

        if (!response.ok) {
          throw new Error('Failed to follow');
        }

        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Si è verificato un errore. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || checking) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleFollow}
      >
        {showIcon && <UserPlus className="h-4 w-4 mr-2" />}
        {followText}
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      className={className}
      onClick={handleFollow}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {showIcon &&
            (isFollowing ? (
              <UserMinus className="h-4 w-4 mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            ))}
          {isFollowing ? unfollowText : followText}
        </>
      )}
    </Button>
  );
}
