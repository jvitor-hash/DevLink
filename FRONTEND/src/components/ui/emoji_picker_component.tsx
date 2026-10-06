import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ---------------------------------------------------------------- */
/* Config                                                           */
/* ---------------------------------------------------------------- */

const DEFAULT_DATA_URL =
  "https://cdn.jsdelivr.net/npm/unicode-emoji-json/data-by-group.json";

const CATEGORY_META = {
  "Smileys & Emotion": { label: "Smileys",    icon: "😀" },
  "People & Body":     { label: "People",     icon: "👋" },
  "Animals & Nature":  { label: "Animals",    icon: "🐻" },
  "Food & Drink":      { label: "Food",       icon: "🍕" },
  "Activities":        { label: "Activities", icon: "⚽" },
  "Travel & Places":   { label: "Travel",     icon: "✈️" },
  "Objects":           { label: "Objects",    icon: "💡" },
  "Symbols":           { label: "Symbols",    icon: "❤️" },
  "Flags":             { label: "Flags",      icon: "🏁" },
};

const SKIPPED_GROUPS = new Set(["Component"]);

const RECENTS_KEY = "emoji-picker:recents";
const MAX_RECENTS = 24;
const RECENTS_ID = "__recents__";

/* ---------------------------------------------------------------- */
/* Data loading (unchanged)                                         */
/* ---------------------------------------------------------------- */

async function fetchEmojiCategories(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  const raw = await res.json();

  return Object.entries(raw)
    .filter(([group]) => !SKIPPED_GROUPS.has(group))
    .map(([group, entries]) => {
      const items = Array.isArray(entries) ? entries : [];
      const meta = CATEGORY_META[group];

      const emojis = items
        .filter((e) => e && typeof e.emoji === "string")
        .map((e) => {
          const name = e.name || e.slug || "emoji";
          return {
            emoji: e.emoji,
            name,
            search:
              `${name} ${(e.slug || "").replace(/_/g, " ")} ${group}`.toLowerCase(),
          };
        });

      return {
        id: group,
        label: meta?.label ?? group,
        icon: meta?.icon ?? emojis[0]?.emoji ?? "🔹",
        emojis,
      };
    })
    .filter((cat) => cat.emojis.length > 0);
}

function loadRecents() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((e) => e && typeof e.emoji === "string").slice(0, MAX_RECENTS)
      : [];
  } catch {
    return [];
  }
}

/* ---------------------------------------------------------------- */
/* Grid                                                             */
/* ---------------------------------------------------------------- */

function EmojiGrid({ items, onSelect }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(42px,1fr))] gap-0.5">
      {items.map((item) => (
        <button
          key={item.emoji}
          type="button"
          title={item.name}
          aria-label={`Insert ${item.name}`}
          onClick={() => onSelect(item)}
          className="flex aspect-square items-center justify-center rounded-lg text-2xl leading-none transition hover:bg-blue-100/70 active:scale-90"
        >
          {item.emoji}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* EmojiPicker                                                      */
/* ---------------------------------------------------------------- */

export default function EmojiPicker({
  onSelect,
  dataUrl = DEFAULT_DATA_URL,
  width = 360,
  bodyHeight = 320,
  placeholder = "Search emoji…",
}) {
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [recents, setRecents] = useState(loadRecents);
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    try {
      const cats = await fetchEmojiCategories(dataUrl, controller.signal);
      if (controller.signal.aborted) return;
      setCategories(cats);
      setStatus("ready");
      setActiveId((current) =>
        cats.some((c) => c.id === current) ? current : cats[0]?.id ?? null
      );
    } catch (err) {
      if (err?.name !== "AbortError" && !controller.signal.aborted) {
        setStatus("error");
      }
    }
  }, [dataUrl]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  const tabs = useMemo(() => {
    const list = recents.length
      ? [{ id: RECENTS_ID, label: "Recent", icon: "🕘", emojis: recents }]
      : [];
    return list.concat(categories);
  }, [categories, recents]);

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0] ?? null;

  const trimmed = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!trimmed) return null;
    const terms = trimmed.split(/\s+/).filter(Boolean);
    const seen = new Set();
    const out = [];
    for (const cat of categories) {
      for (const item of cat.emojis) {
        if (seen.has(item.emoji)) continue;
        if (terms.every((t) => item.search.includes(t))) {
          seen.add(item.emoji);
          out.push(item);
        }
      }
    }
    return out;
  }, [trimmed, categories]);

  const isSearching = searchResults !== null;

  const handleSelect = useCallback(
    (item) => {
      setRecents((prev) => {
        const next = [
          item,
          ...prev.filter((r) => r.emoji !== item.emoji),
        ].slice(0, MAX_RECENTS);
        try {
          localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
        } catch {
          /* storage disabled — ignore */
        }
        return next;
      });
      onSelect?.(item);
    },
    [onSelect]
  );

  const handleTabClick = (tab) => {
    setQuery("");
    setActiveId(tab.id);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchResults?.length) handleSelect(searchResults[0]);
    if (e.key === "Escape") setQuery("");
  };

  /* ---- render ---- */
  return (
    <section
      className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg shadow-gray-200/60"
      style={{ width }}
      aria-label="Emoji picker"
    >
      {/* 1. Search bar */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5">
        <span className="text-[13px] opacity-50" aria-hidden="true">🔍</span>
        <input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          aria-label="Search emoji"
          className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
      </div>

      {/* 2. Category tabs (hidden while searching) */}
      {status === "ready" && !isSearching && tabs.length > 0 && (
        <div
          role="tablist"
          aria-label="Emoji categories"
          className="flex gap-1 overflow-x-auto border-b border-gray-100 px-2 pt-1.5 [scrollbar-width:thin]"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab?.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                title={tab.label}
                onClick={() => handleTabClick(tab)}
                className={`flex flex-col items-center gap-0.5 whitespace-nowrap rounded-t-lg px-2.5 py-1.5 leading-none transition-colors ${
                  isActive
                    ? "bg-slate-50 text-gray-900 shadow-[inset_0_-2px_0_0_#3b82f6]"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <span className="text-[17px]" aria-hidden="true">{tab.icon}</span>
                <span className="text-[10px] font-semibold tracking-wide">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Results */}
      <div className="overflow-y-auto p-2" style={{ height: bodyHeight }}>
        {status === "loading" && (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-sm text-gray-400">
            Loading emojis…
          </div>
        )}

        {status === "error" && (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2.5 text-sm text-gray-500">
            <span>Couldn't load emojis.</span>
            <button
              type="button"
              onClick={load}
              className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-[13px] transition-colors hover:bg-gray-50"
            >
              Retry
            </button>
          </div>
        )}

        {status === "ready" && isSearching &&
          (searchResults.length ? (
            <>
              <div className="px-1 pb-1.5 text-[11px] text-gray-400">
                {searchResults.length} result{searchResults.length === 1 ? "" : "s"}
              </div>
              <EmojiGrid items={searchResults} onSelect={handleSelect} />
            </>
          ) : (
            <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-gray-400">
              No emojis match “{query.trim()}”
            </div>
          ))}

        {status === "ready" && !isSearching && activeTab && (
          <EmojiGrid items={activeTab.emojis} onSelect={handleSelect} />
        )}
      </div>
    </section>
  );
}
