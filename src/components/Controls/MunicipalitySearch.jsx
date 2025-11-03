import { useEffect, useMemo, useRef, useState } from 'react';
import { getAllMunicipalities } from '../../api/municipalities';

/**
 * MunicipalitySearch - Search and select municipalities
 * Adapted from risk-profiler-web
 * Props:
 *  - onSelect: (municipality) => void
 */
const MunicipalitySearch = ({ onSelect }) => {
  const [all, setAll] = useState([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Load all municipalities once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getAllMunicipalities();
        if (!cancelled) {
          // Transform to search format with bbox
          const municipalities = (data.data || data || []).map(m => {
            // Parse lat/lon as floats (API returns them as strings)
            const lat = parseFloat(m.centroid_lat || 0);
            const lon = parseFloat(m.centroid_lon || 0);

            return {
              code: m.municipality_code || m.code,
              name: m.municipality_name || m.name,
              province: m.province,
              district: m.district_name,
              // Calculate bbox from centroid (approximate ±0.5 degrees)
              bbox: m.bbox || [
                lon - 0.5,
                lat - 0.5,
                lon + 0.5,
                lat + 0.5
              ]
            };
          });
          setAll(municipalities);
        }
      } catch (error) {
        console.error('Failed to load municipalities:', error);
        if (!cancelled) setAll([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Normalize and filter
  const norm = (s) => String(s || '').toLowerCase().normalize('NFKD');
  const filtered = useMemo(() => {
    const qq = norm(query);
    if (!qq) return [];

    const byScore = all
      .map((m) => {
        const name = norm(m.name);
        const code = norm(m.code);
        const province = norm(m.province);

        let score = 0;
        if (name.startsWith(qq)) score += 4;
        if (name.includes(qq)) score += 1;
        if (code.includes(qq)) score += 2;
        if (province.includes(qq)) score += 0.5;
        return { ...m, _score: score };
      })
      .filter((m) => m._score > 0)
      .sort((a, b) => b._score - a._score || a.name.localeCompare(b.name));

    return byScore.slice(0, 10);
  }, [all, query]);

  // Keyboard handling
  const onInputKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const first = listRef.current?.querySelector('button');
      first?.focus();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
    // Notify parent to zoom back to default view
    onSelect?.(null);
  };

  const onItemKeyDown = (e, item) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePick(item);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      inputRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const buttons = Array.from(listRef.current?.querySelectorAll('button') || []);
      const idx = buttons.indexOf(e.currentTarget);
      const nextIdx = e.key === 'ArrowDown'
        ? Math.min(idx + 1, buttons.length - 1)
        : Math.max(idx - 1, 0);
      buttons[nextIdx]?.focus();
    }
  };

  const handlePick = (item) => {
    setOpen(false);
    setQuery(item?.name || '');
    onSelect?.(item);
  };

  const showList = open && query && (filtered.length > 0 || !loading);

  return (
    <div className="searchbox">
      <label
        className="text-xs font-medium"
        style={{ color: '#475569' }}
        htmlFor="municipality-search"
      >
        Municipality Search
      </label>

      <div className={`searchbox__control ${open ? 'is-open' : ''}`} style={{ marginTop: '6px' }}>
        <input
          id="municipality-search"
          ref={inputRef}
          className="searchbox__input"
          type="text"
          value={query}
          placeholder="Type municipality name or code…"
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={onInputKeyDown}
          autoComplete="off"
        />

        {/* Right-side hints / spinner / clear */}
        {loading ? (
          <div className="searchbox__spinner" aria-hidden />
        ) : query ? (
          <button
            type="button"
            className="searchbox__clear"
            onClick={clearSearch}
            aria-label="Clear"
          >
            ×
          </button>
        ) : (
          <kbd className="searchbox__kbd">/</kbd>
        )}
      </div>

      {showList && (
        <div className="searchbox__list" role="listbox" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="searchbox__empty">No matches</div>
          ) : (
            filtered.map((m) => (
              <button
                key={m.code}
                type="button"
                className="searchbox__item"
                role="option"
                aria-selected="false"
                onClick={() => handlePick(m)}
                onKeyDown={(e) => onItemKeyDown(e, m)}
                title={m.name}
              >
                <div className="searchbox__item-name">{m.name}</div>
                <div className="searchbox__item-sub">
                  {m.code} • {m.province}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MunicipalitySearch;
