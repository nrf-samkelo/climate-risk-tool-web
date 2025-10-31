import { useState, useEffect, useCallback, useRef } from 'react';
import { useClimate } from '../../context/ClimateContext';
import { PERIODS, ANIMATION_CONFIG } from '../../utils/constants';

/**
 * TimeSeriesPlayer - Animation controls for time series playback
 * Uses PERIODS constant and ClimateContext
 * Auto-fetches data when period changes (via ClimateContext)
 * Allows scenario changes during playback
 */
const TimeSeriesPlayer = () => {
  const { period, setPeriod, loading } = useClimate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(ANIMATION_CONFIG.intervalMs);
  const intervalRef = useRef(null);

  // Get current period index
  const currentIndex = PERIODS.findIndex(p => p.value === period);

  // Navigate to specific period
  const goToPeriod = useCallback((index) => {
    if (index >= 0 && index < PERIODS.length) {
      setPeriod(PERIODS[index].value);
    }
  }, [setPeriod]);

  // Navigation handlers
  const goToFirst = () => {
    goToPeriod(0);
    setIsPlaying(false);
  };

  const goToLast = () => {
    goToPeriod(PERIODS.length - 1);
    setIsPlaying(false);
  };

  const goToPrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : PERIODS.length - 1;
    goToPeriod(prevIndex);
  };

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % PERIODS.length;
    goToPeriod(nextIndex);
  };

  // Play/Pause toggle
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        goToNext();
      }, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speed, currentIndex]); // Dependency on currentIndex ensures proper looping

  // Speed options
  const speedOptions = [
    { value: 1000, label: '1s' },
    { value: 2000, label: '2s' },
    { value: 3000, label: '3s' },
    { value: 5000, label: '5s' },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-elevation-lg p-3 z-1000">
      <div className="flex items-center gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {/* First */}
          <button
            onClick={goToFirst}
            disabled={loading}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="First period"
            aria-label="Go to first period"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
            </svg>
          </button>

          {/* Previous */}
          <button
            onClick={goToPrevious}
            disabled={loading}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous period"
            aria-label="Go to previous period"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={loading}
            className="p-3 rounded-full bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            onClick={goToNext}
            disabled={loading}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next period"
            aria-label="Go to next period"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
          </button>

          {/* Last */}
          <button
            onClick={goToLast}
            disabled={loading}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Last period"
            aria-label="Go to last period"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Progress Bar */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="flex-1">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / PERIODS.length) * 100}%`
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              {PERIODS.map((p, idx) => (
                <button
                  key={p.value}
                  onClick={() => goToPeriod(idx)}
                  className={`hover:text-primary-600 ${
                    idx === currentIndex ? 'font-bold text-primary-600' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Current Period Display */}
        <div className="text-sm font-semibold text-gray-800 min-w-[120px]">
          {PERIODS[currentIndex]?.label.split('(')[1]?.replace(')', '') || period}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300" />

        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Speed:</label>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {speedOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg
              className="animate-spin h-4 w-4 text-primary-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSeriesPlayer;
