'use client';

import Image from 'next/image';
import { Music2, ExternalLink, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type DJ = {
  id: string;
  name: string;
  stageName?: string;
  avatar?: string;
  bio?: string;
  genres?: string[];
  spotifyUrl?: string;
  instagramUrl?: string;
  isResident?: boolean;
};

type DJLineupProps = {
  djs: DJ[];
};

export function DJLineup({ djs }: DJLineupProps) {
  const residentDJs = djs.filter((dj) => dj.isResident);
  const guestDJs = djs.filter((dj) => !dj.isResident);

  const DJCard = ({ dj }: { dj: DJ }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex gap-4 p-4">
        {/* Avatar */}
        <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
          {dj.avatar ? (
            <Image
              src={dj.avatar}
              alt={dj.stageName || dj.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="w-8 h-8 text-white" />
            </div>
          )}
          {dj.isResident && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold text-center py-0.5">
              RESIDENT
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base line-clamp-1">
            {dj.stageName || dj.name}
          </h3>
          {dj.stageName && (
            <p className="text-xs text-muted-foreground">{dj.name}</p>
          )}
          {dj.bio && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {dj.bio}
            </p>
          )}
          {dj.genres && dj.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {dj.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-3">
            {dj.spotifyUrl && (
              <a
                href={dj.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                Ascolta
              </a>
            )}
            {dj.instagramUrl && (
              <a
                href={dj.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Profilo
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Resident DJs */}
      {residentDJs.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Music2 className="w-5 h-5 text-primary" />
            DJ Resident
          </h3>
          <div className="space-y-3">
            {residentDJs.map((dj) => (
              <DJCard key={dj.id} dj={dj} />
            ))}
          </div>
        </div>
      )}

      {/* Guest DJs */}
      {guestDJs.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3">Guest DJ</h3>
          <div className="space-y-3">
            {guestDJs.map((dj) => (
              <DJCard key={dj.id} dj={dj} />
            ))}
          </div>
        </div>
      )}

      {/* Spotify Playlist */}
      <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h4 className="font-bold">Playlist Ufficiale</h4>
            <p className="text-xs text-muted-foreground">
              Ascolta la nostra selezione
            </p>
          </div>
        </div>
        <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
          <Play className="w-4 h-4 mr-2" />
          Apri su Spotify
        </Button>
      </Card>
    </div>
  );
}
