import { motion } from 'framer-motion';
import { Mic2 } from 'lucide-react';
import type { TrendingExample } from '../types';

interface Props {
  song: TrendingExample;
  onSelect: (videoId: string) => void;
}

export default function RecentSongsCard({ song, onSelect }: Props) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="glass rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => onSelect(song.videoId)}
      role="button"
      tabIndex={0}
      aria-label={`Play ${song.title} by ${song.artist}`}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(song.videoId)}
    >
      {}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={`https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`}
          alt={`${song.title} thumbnail`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
        {}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Mic2 size={20} className="text-white ml-0.5" />
          </motion.div>
        </div>
        {}
        <div className="absolute top-2 right-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(168,85,247,0.8)', color: 'white' }}>
            Karaoke
          </span>
        </div>
      </div>

      {}
      <div className="p-3">
        <p className="text-sm font-semibold text-white truncate leading-tight">{song.title}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{song.artist}</p>
      </div>
    </motion.div>
  );
}
