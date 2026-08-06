'use client';

import React from 'react';
import { Star, BookOpen, FileText } from 'lucide-react';

const MOCK_FAVORITES = [
  {
    id: '1',
    title: 'Trading in the Zone',
    author: 'Mark Douglas',
    type: 'ebook',
    collection: 'Trading',
    coverColor: 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
  },
  {
    id: '2',
    title: 'The Productive Muslim',
    author: 'Mohammed Faris',
    type: 'ebook',
    collection: 'Quran',
    coverColor: 'bg-amber-950/40 border-amber-500/20 text-amber-400'
  },
  {
    id: '3',
    title: 'Consistency in trading is built upon the acceptance of risk...',
    author: 'Trading in the Zone (Page 112)',
    type: 'highlight',
    collection: 'Trading',
    coverColor: ''
  }
];

export default function Favorites() {
  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-sm font-medium text-muted-custom uppercase tracking-widest mb-1">
          Hand-picked resources
        </h1>
        <p className="font-handwritten text-5xl md:text-6xl font-bold tracking-tight text-header-custom">
          Favorites
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {MOCK_FAVORITES.map((fav) => (
          <div key={fav.id} className="bg-card border border-border-custom rounded-3xl p-5 shadow-sm hover:border-accent-gold/20 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-accent-gold uppercase tracking-wider">
                  {fav.collection}
                </span>
                <Star className="w-4 h-4 text-accent-gold fill-accent-gold" />
              </div>

              {fav.type === 'highlight' ? (
                <div className="border-l-2 border-accent-gold/30 pl-3 py-1 italic text-xs text-foreground/90 leading-relaxed mb-4">
                  "{fav.title}"
                </div>
              ) : (
                <h3 className="font-serif font-bold text-base text-foreground mb-1 leading-snug">
                  {fav.title}
                </h3>
              )}
              <p className="text-xs text-muted-custom">
                {fav.type === 'highlight' ? `Highlight from ${fav.author}` : `by ${fav.author}`}
              </p>
            </div>

            <div className="flex justify-between items-center mt-6 pt-3 border-t border-border-custom/50 text-[10px] text-muted-custom">
              <span className="uppercase font-bold tracking-widest text-[9px]">
                {fav.type}
              </span>
              <button className="text-accent-gold font-semibold hover:underline">
                Open Item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
