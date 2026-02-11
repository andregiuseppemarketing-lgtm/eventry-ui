'use client';

import Image from 'next/image';
import { Users, UserPlus, TrendingUp, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Friend = {
  id: string;
  name: string;
  avatar?: string;
};

type PR = {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  phone?: string;
};

type CommunitySectionProps = {
  followersCount: number;
  friendsFollowing: Friend[];
  upcomingAttendees: number;
  officialPRs: PR[];
  badges?: string[];
};

export function CommunitySection({
  followersCount,
  friendsFollowing,
  upcomingAttendees,
  officialPRs,
  badges = [],
}: CommunitySectionProps) {
  return (
    <div className="space-y-6">
      {/* Social Proof Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {badge}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Friends Following */}
      {friendsFollowing.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">I tuoi amici seguono questo locale</h3>
            <span className="text-xs text-muted-foreground">
              {friendsFollowing.length} {friendsFollowing.length === 1 ? 'amico' : 'amici'}
            </span>
          </div>
          <div className="flex -space-x-2 mb-3">
            {friendsFollowing.slice(0, 5).map((friend) => (
              <div
                key={friend.id}
                className="relative w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400"
              >
                {friend.avatar ? (
                  <Image
                    src={friend.avatar}
                    alt={friend.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-white font-bold">
                    {friend.name.charAt(0)}
                  </div>
                )}
              </div>
            ))}
            {friendsFollowing.length > 5 && (
              <div className="relative w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                <span className="text-xs font-bold">+{friendsFollowing.length - 5}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {friendsFollowing.slice(0, 2).map((f) => f.name).join(', ')}
            {friendsFollowing.length > 2 && ` e altri ${friendsFollowing.length - 2}`}
          </p>
        </Card>
      )}

      {/* Upcoming Attendees */}
      {upcomingAttendees > 0 && (
        <Card className="p-4 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold">{upcomingAttendees.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                persone parteciperanno ai prossimi eventi
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
        </Card>
      )}

      {/* Official PRs */}
      {officialPRs.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            PR Ufficiali
          </h3>
          <div className="space-y-2">
            {officialPRs.map((pr) => (
              <Card key={pr.id} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                    {pr.avatar ? (
                      <Image
                        src={pr.avatar}
                        alt={pr.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-white font-bold">
                        {pr.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{pr.name}</div>
                    <div className="text-xs text-muted-foreground">{pr.role}</div>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    Contatta
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Community Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="font-bold text-lg">{followersCount.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Followers</div>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <div className="font-bold text-lg">+24%</div>
          <div className="text-xs text-muted-foreground">Ultimo mese</div>
        </Card>
      </div>
    </div>
  );
}
