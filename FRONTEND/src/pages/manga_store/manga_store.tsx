import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  BookOpen,
  Compass,
  Bookmark,
  Settings,
  Smartphone,
  ChevronDown,
  Star,
  Download,
  Clock,
  Layers,
} from "react-feather";

interface AppItem {
  id: string;
  name: string;
  handle: string;
  tech: string;
  description: string;
  platforms: string[];
  rating: string;
  downloads: string;
  timeAgo: string;
  isNew?: boolean;
  version?: string;
  iconSymbol: string;
}

const FEED_APPS: AppItem[] = [
  {
    id: "1",
    name: "MANGA READER Z",
    handle: "@handees",
    tech: "REACT / WASM",
    description: "Next-gen manga reader & indie visual zine creation tool with vector screentone engine.",
    platforms: ["WEB", "IOS", "ANDROID"],
    rating: "4.9",
    downloads: "50.2K",
    timeAgo: "2h ago",
    isNew: true,
    version: "v1.2.10",
    iconSymbol: "巻",
  },
  {
    id: "2",
    name: "DOKUSHO ENGINE",
    handle: "@nongee",
    tech: "TYPESCRIPT",
    description: "Ultra-fast offline CBZ/CBR panel parsing framework designed for high-density displays.",
    platforms: ["MAC", "LINUX", "WINDOWS"],
    rating: "4.8",
    downloads: "128.5K",
    timeAgo: "1d ago",
    isNew: true,
    version: "v2.0.4",
    iconSymbol: "書",
  },
  {
    id: "3",
    name: "INK & SCREENTONE",
    handle: "@studio_kairu",
    tech: "CANVAS API",
    description: "Indie digital brush studio generating retro halftone patterns and comic panel layouts.",
    platforms: ["IPAD", "WEB"],
    rating: "4.95",
    downloads: "84.1K",
    timeAgo: "3d ago",
    iconSymbol: "画",
  },
];

const CATEGORY_FILTERS: string[] = [
  "ALL APPS",
  "MANGA READERS",
  "RETRO TOOLS",
  "NEW RELEASES",
  "INDIE ZINES",
];

export default function MangaStorePage(): React.ReactElement {
  const [activeFilter, setActiveFilter] = useState<string>("ALL APPS");
  const [activeTab, setActiveTab] = useState<number>(1);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("ALL PLATFORMS");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#161212] py-4 sm:py-8 px-2 flex flex-col items-center justify-center font-sans antialiased">
      {/* Mobile viewport frame: 9:19.5 portrait ratio mock */}
      <div className="relative w-full max-w-[420px] min-h-[860px] manga-grid-bg border-4 border-[#161212] manga-shadow overflow-hidden flex flex-col text-[#161212]">
        
        {/* Speed-lines top-right radiating background effect */}
        <div className="absolute inset-0 manga-speedlines pointer-events-none z-0 opacity-60" />

        {/* 1. Header */}
        <header className="relative z-10 bg-[#F3EEE2] px-5 pt-6 pb-4 border-b-4 border-[#161212] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="manga-font-display text-4xl leading-none text-[#161212]">
                MANGA <span className="text-[#D6212B]">STORE</span>
              </span>
            </div>
            
            <p className="text-xs font-bold text-[#6B6660] tracking-widest uppercase mt-1">
              発見 · DISCOVER APPS
            </p>
          </div>

          <Link
            to="/"
            className="bg-[#F3EEE2] border-2 border-[#161212] px-2 py-1 text-xs font-bold uppercase hover:bg-[#D6212B] hover:text-white transition-colors manga-shadow-sm"
          >
            EXIT
          </Link>
        </header>

        {/* Scrollable Main Area */}
        <div className="relative z-10 flex-1 overflow-y-auto px-4 py-5 space-y-5">
          
          {/* 2. Platform Selector */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#161212] flex items-center gap-1">
              <Layers size={14} className="text-[#D6212B]" /> BROWSING
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-[#D6212B] text-white px-3 py-1.5 border-4 border-[#161212] manga-shadow-sm text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:bg-[#b51821] transition-colors"
              >
                <Smartphone size={14} />
                <span>{selectedPlatform}</span>
                <ChevronDown size={14} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#F3EEE2] border-4 border-[#161212] manga-shadow z-30 flex flex-col">
                  {["ALL PLATFORMS", "MOBILE", "DESKTOP", "WEB"].map((platform: string) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => {
                        setSelectedPlatform(platform);
                        setIsDropdownOpen(false);
                      }}
                      className="px-3 py-2 text-left text-xs font-extrabold uppercase border-b-2 border-[#161212] hover:bg-[#D6212B] hover:text-white transition-colors"
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Filter Chips */}
          <div className="overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar flex items-center gap-3">
            {CATEGORY_FILTERS.map((chip: string) => {
              const isActive = activeFilter === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setActiveFilter(chip)}
                  className={`shrink-0 -skew-x-6 border-4 border-[#161212] px-3.5 py-1.5 text-xs font-black tracking-wider uppercase transition-transform cursor-pointer ${
                    isActive
                      ? "bg-[#D6212B] text-white manga-shadow-sm"
                      : "bg-[#F3EEE2] text-[#161212] hover:bg-[#e4ddcd]"
                  }`}
                >
                  <span className="inline-block skew-x-6">{chip}</span>
                </button>
              );
            })}
          </div>

          {/* 4. App Cards Feed */}
          <div className="space-y-6">
            {FEED_APPS.map((app: AppItem) => (
              <article
                key={app.id}
                className="relative bg-[#F3EEE2] border-4 border-[#161212] manga-shadow p-4.5 transition-all"
              >
                {/* NEW RELEASE Tag */}
                {app.isNew && (
                  <div className="absolute -top-3.5 -right-2 z-20 flex flex-col items-end">
                    <span className="bg-[#D6212B] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 border-2 border-[#161212] -rotate-2 shadow-[2px_2px_0px_#161212]">
                      NEW RELEASE
                    </span>
                    {app.version && (
                      <span className="text-[10px] font-black text-[#6B6660] uppercase tracking-tighter mt-0.5">
                        {app.version}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-start gap-3.5">
                  {/* 76px Icon with halftone overlay */}
                  <div className="relative w-[76px] h-[76px] bg-[#D6212B] border-4 border-[#161212] flex items-center justify-center shrink-0 overflow-hidden">
                    <div className="absolute inset-0 manga-halftone opacity-40 pointer-events-none" />
                    <span className="relative z-10 manga-font-display text-4xl text-white">
                      {app.iconSymbol}
                    </span>
                  </div>

                  {/* App Header Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="manga-font-display text-2xl leading-none text-[#161212] truncate">
                      {app.name}
                    </h2>
                    
                    <div className="flex items-center gap-1.5 text-xs text-[#6B6660] font-bold tracking-tight mt-1 flex-wrap">
                      <span>{app.handle}</span>
                      <span>◆</span>
                      <span className="text-[#161212] font-black">{app.tech}</span>
                    </div>

                    {/* Platform Badges */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {app.platforms.map((p: string) => (
                        <span
                          key={p}
                          className="border border-[#161212] px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase text-[#161212] bg-[#F3EEE2]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="manga-font-body text-xs text-[#161212] leading-relaxed mt-3">
                  {app.description}
                </p>

                {/* Thin 2px divider */}
                <div className="h-[2px] bg-[#BDB8AE] my-3" />

                {/* Stats Row */}
                <div className="flex items-center justify-between text-xs font-extrabold text-[#161212]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-[#D6212B] text-[#D6212B]" />
                      <span>{app.rating}</span>
                    </span>

                    <span className="flex items-center gap-1 text-[#6B6660]">
                      <Download size={14} />
                      <span>{app.downloads}</span>
                    </span>

                    <span className="flex items-center gap-1 text-[#6B6660]">
                      <Clock size={14} />
                      <span>{app.timeAgo}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    className="manga-font-display text-base text-[#161212] hover:text-[#D6212B] transition-colors flex items-center gap-0.5 cursor-pointer"
                  >
                    READ &gt;
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* 5. Bottom Tab Bar */}
        <nav className="relative z-10 bg-[#F3EEE2] border-t-4 border-[#161212] px-4 py-3 flex items-center justify-around">
          {[
            { icon: Home, label: "HOME" },
            { icon: BookOpen, label: "STORE" },
            { icon: Compass, label: "EXPLORE" },
            { icon: Bookmark, label: "SAVED" },
            { icon: Settings, label: "SETTINGS" },
          ].map(({ icon: Icon, label }, idx: number) => {
            const isActive = activeTab === idx;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`p-2 transition-transform cursor-pointer ${
                  isActive
                    ? "bg-[#D6212B] text-white border-2 border-[#161212] shadow-[3px_3px_0px_#161212]"
                    : "text-[#161212] hover:text-[#D6212B]"
                }`}
                title={label}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
