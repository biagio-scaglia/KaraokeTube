import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic2, ArrowRight, Sparkles, Music2 } from 'lucide-react';
import { extractVideoId } from '../utils/fetchYouTubeMeta';
import RecentSongsCard from './RecentSongsCard';
import { TRENDING_EXAMPLES } from '../data/trending';

interface Props {
  onStart: (videoId: string) => void;
}

export default function Homepage({ onStart }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      setError('Please enter a valid YouTube URL or video ID.');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    setError('');
    onStart(videoId);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-8">
        {}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4 mb-10"
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center glow-purple"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
          >
            <Mic2 size={38} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gradient">
              KaraokeTube
            </h1>
            <p className="mt-2 text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
              Paste any YouTube link and sing along with synced lyrics
            </p>
          </div>
        </motion.div>

        {}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="w-full max-w-xl"
        >
          <motion.div
            animate={shaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <div
              className="flex items-center gap-3 p-2 pl-5 rounded-2xl border transition-all duration-200"
              style={{
                background: 'var(--bg-card)',
                borderColor: error ? '#f87171' : 'rgba(168,85,247,0.4)',
                boxShadow: error
                  ? '0 0 0 2px rgba(248,113,113,0.2)'
                  : '0 0 0 1px rgba(168,85,247,0.1), 0 8px 30px rgba(0,0,0,0.3)',
              }}
            >
              <Music2 size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                value={url}
                onChange={e => { setUrl(e.target.value); setError(''); }}
                placeholder="Paste a YouTube URL… e.g. https://youtube.com/watch?v=…"
                className="flex-1 bg-transparent text-sm sm:text-base outline-none placeholder:text-slate-600 text-white"
                aria-label="YouTube URL"
                autoComplete="off"
                onPaste={e => {
                  const text = e.clipboardData.getData('text');
                  const id = extractVideoId(text.trim());
                  if (id) {
                    e.preventDefault();
                    setUrl(text.trim());
                    setError('');
                  }
                }}
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(168,85,247,0.4)',
                }}
              >
                <span className="hidden sm:inline">Start Karaoke</span>
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-2 text-sm text-red-400 px-2"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>

        {}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap justify-center gap-2 mt-5"
        >
          {['Synced Lyrics', 'Free & Open', 'No Sign-up', 'Dark Mode', 'Mobile Friendly'].map(f => (
            <span
              key={f}
              className="text-xs px-3 py-1 rounded-full"
              style={{
                background: 'rgba(168,85,247,0.1)',
                border: '1px solid rgba(168,85,247,0.2)',
                color: 'var(--text-secondary)',
              }}
            >
              {f}
            </span>
          ))}
        </motion.div>
      </div>

      {}
      <section className="px-4 pb-16 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Sparkles size={16} style={{ color: '#a855f7' }} />
            <h2 className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: 'var(--text-secondary)' }}>
              Popular Karaoke Songs
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TRENDING_EXAMPLES.map((song, i) => (
              <motion.div
                key={song.videoId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
              >
                <RecentSongsCard song={song} onSelect={onStart} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
