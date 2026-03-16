import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Homepage from './components/Homepage';
import KaraokeScreen from './components/KaraokeScreen';
import { extractVideoId } from './utils/fetchYouTubeMeta';

const HISTORY_KEY = 'karaoke_history';

function loadHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveHistory(ids: string[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(ids.slice(0, 20)));
}

export default function App() {
  const [videoId, setVideoId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('v');
    return v && extractVideoId(v) ? v : null;
  });
  const [history, setHistory] = useState<string[]>(loadHistory);

  const handleStart = (id: string) => {
    setVideoId(id);
    const updated = [id, ...history.filter(h => h !== id)];
    setHistory(updated);
    saveHistory(updated);
    window.history.replaceState(null, '', `?v=${id}`);
  };

  const handleBack = () => {
    setVideoId(null);
    window.history.replaceState(null, '', '/');
  };

  return (
    <AnimatePresence mode="wait">
      {videoId ? (
        <motion.div
          key="karaoke"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <KaraokeScreen key={videoId} videoId={videoId} onBack={handleBack} />
        </motion.div>
      ) : (
        <motion.div
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Homepage onStart={handleStart} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
