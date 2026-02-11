'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

type Story = {
  id: string;
  category: string;
  icon: string;
  image: string;
  title: string;
  duration?: number;
};

type StoriesHighlightsProps = {
  clubName: string;
  stories: Story[];
};

export function StoriesHighlights({ clubName, stories }: StoriesHighlightsProps) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openStory = (story: Story, index: number) => {
    setSelectedStory(story);
    setCurrentIndex(index);
  };

  const closeStory = () => {
    setSelectedStory(null);
  };

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setSelectedStory(stories[next]);
    } else {
      closeStory();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      setSelectedStory(stories[prev]);
    }
  };

  return (
    <>
      {/* Highlights Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {stories.map((story, index) => (
          <button
            key={story.id}
            onClick={() => openStory(story, index)}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-background p-[2px]">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  {story.image ? (
                    <Image
                      src={story.image}
                      alt={story.category}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                      {story.icon}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs font-medium max-w-[64px] truncate">
              {story.category}
            </span>
          </button>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4">
            <div className="flex gap-1 mb-3">
              {stories.map((_, index) => (
                <div
                  key={index}
                  className={`h-0.5 flex-1 rounded-full ${
                    index === currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm" />
                <span className="text-white font-semibold text-sm">{clubName}</span>
              </div>
              <button
                onClick={closeStory}
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedStory.image && (
              <Image
                src={selectedStory.image}
                alt={selectedStory.title}
                fill
                className="object-contain"
              />
            )}
            
            {/* Navigation */}
            <button
              onClick={prevStory}
              className="absolute left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextStory}
              className="absolute right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-white font-bold text-lg">{selectedStory.title}</h3>
            <p className="text-white/80 text-sm">{selectedStory.category}</p>
          </div>
        </div>
      )}
    </>
  );
}
