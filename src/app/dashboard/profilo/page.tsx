import { Suspense } from 'react';
import { UserProfilePageContent } from '@/components/dashboard/profilo-page-client';


function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
          <div className="w-20 h-6 bg-muted rounded animate-pulse" />
          <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        <div className="flex justify-center">
          <div className="w-32 h-24 bg-card rounded-2xl animate-pulse" />
        </div>
        <div className="flex justify-center">
          <div className="h-6 w-32 bg-card rounde animate-pulse" />
        </div>
        <div className="flex justify-center gap-6">
          <div className="h-12 w-20 bg-card rounded animate-pulse" />
          <div className="h-12 w-20 bg-card rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <UserProfilePageContent />
    </Suspense>
  );
}

