'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProfileLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
  ctaBar: React.ReactNode;
  tabBar: React.ReactNode;
  content: React.ReactNode;
}

/**
 * Profile Layout con IntersectionObserver per sticky behavior
 * Header scroll normale, CTA e Tab bar diventano sticky quando header esce da viewport
 */
export function ProfileLayout({
  header,
  ctaBar,
  tabBar,
  content,
}: ProfileLayoutProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderVisible(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '-1px',
      }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - scroll normale */}
      <div ref={headerRef}>{header}</div>

      {/* CTA Bar - sticky quando header non visibile */}
      <div
        className={cn(
          'cta-bar transition-all duration-200 border-b border-border',
          isHeaderVisible ? 'relative' : 'sticky top-0 z-40 bg-background/95 backdrop-blur-md shadow-sm'
        )}
      >
        {ctaBar}
      </div>

      {/* Tab Bar - sticky sotto CTA bar */}
      <div
        className={cn(
          'tab-bar transition-all duration-200',
          isHeaderVisible ? 'relative' : 'sticky top-14 z-30 bg-background/95 backdrop-blur-md'
        )}
      >
        {tabBar}
      </div>

      {/* Content */}
      <div className="profile-content">{content}</div>
    </div>
  );
}
