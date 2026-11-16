
"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";

type SearchItem = {
  href: string;
  en: string;
  bn: string;
  section: string;
};

export default function NavbarSearch({
  lang,
  items,
  onNavigate,
}: {
  lang: "en" | "bn";
  items: SearchItem[];
  onNavigate: (href: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalized = query.trim().toLocaleLowerCase();
  const results = normalized
    ? items.filter((item) =>
        [item.en, item.bn, item.section, item.href]
          .some((value) =>
            value.toLocaleLowerCase().includes(normalized)
          )
      ).slice(0, 8)
    : [];

  function select(href: string) {
    onNavigate(href);
    setQuery("");
    setOpen(false);
    setActive(0);
    inputRef.current?.blur();
  }

  useEffect(() => {
    function shortcuts(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", shortcuts);
    return () => window.removeEventListener("keydown", shortcuts);
  }, []);

  return (
    <div className="nav-search-root"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <style>{`
        .nav-search-root {
          position: relative;
          flex: 1 1 230px;
          max-width: 425px;
          min-width: 145px;
          z-index: 210;
        }
        .nav-search-box {
          display: flex;
          align-items: center;
          gap: 9px;
          height: 37px;
          padding: 0 12px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.23);
          border-radius: 9px;
          color: #fff;
          box-sizing: border-box;
        }
        .nav-search-box:focus-within {
          background: rgba(255,255,255,.18);
          border-color: rgba(255,255,255,.7);
        }
        .nav-search-input {
          background: transparent;
          border: 0;
          outline: none;
          color: #fff;
          width: 100%;
          min-width: 0;
          font: inherit;
          font-size: 12px;
        }
        .nav-search-input::placeholder {
          color: #d6ebe0;
          opacity: 1;
        }
        .nav-search-key {
          padding: 3px 5px;
          border: 1px solid rgba(255,255,255,.22);
          border-radius: 5px;
          font-size: 10px;
          color: #e4f3eb;
          white-space: nowrap;
        }
        .nav-search-clear {
          display: grid;
          place-items: center;
          border: none;
          background: transparent;
          color: white;
          cursor: pointer;
          padding: 2px;
        }
        .nav-search-results {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          width: min(425px, calc(100vw - 30px));
          max-height: 350px;
          overflow-y: auto;
          background: #fff;
          border: 1px solid #dce9df;
          border-radius: 13px;
          box-shadow: 0 16px 42px rgba(0,35,20,.22);
          padding: 8px;
          color: #183e2e;
        }
        .nav-search-caption {
          padding: 8px 10px;
          font-size: 10px;
          color: #7b8e81;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
        }
        .nav-search-result {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 11px;
          border: 0;
          border-radius: 9px;
          text-align: left;
          background: white;
          color: #163e2d;
          cursor: pointer;
        }
        .nav-search-result:hover,
        .nav-search-result.active {
          background: #eaf6ee;
        }
        .nav-search-result-label {
          flex: 1;
          min-width: 0;
        }
        .nav-search-result-label strong {
          display: block;
          font-size: 12px;
        }
        .nav-search-result-label small {
          display: block;
          margin-top: 4px;
          font-size: 10px;
          color: #75877c;
        }
        .nav-search-empty {
          padding: 18px 12px;
          text-align: center;
          font-size: 12px;
          color: #667d6e;
        }
        @media(max-width:767px) {
          .nav-search-root { display: none; }
        }
      `}</style>

      <div className="nav-search-box">
        <Search size={16} aria-hidden="true"/>
        <input
          ref={inputRef}
          className="nav-search-input"
          aria-label="Search modules"
          aria-expanded={open && !!normalized}
          placeholder={
            lang === "bn"
              ? "মডিউল বা ফিচার খুঁজুন..."
              : "Search modules and features..."
          }
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
            if (event.key === "ArrowDown" && results.length) {
              event.preventDefault();
              setActive((index) => (index + 1) % results.length);
            }
            if (event.key === "ArrowUp" && results.length) {
              event.preventDefault();
              setActive((index) =>
                (index - 1 + results.length) % results.length
              );
            }
            if (event.key === "Enter" && results.length) {
              event.preventDefault();
              select(results[Math.min(active, results.length - 1)].href);
            }
          }}
        />
        {query ? (
          <button className="nav-search-clear"
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}>
            <X size={15}/>
          </button>
        ) : (
          <span className="nav-search-key">Ctrl K</span>
        )}
      </div>

      {open && !!normalized && (
        <div className="nav-search-results">
          <div className="nav-search-caption">
            {lang === "bn" ? "মডিউল খোঁজার ফলাফল" : "Matching modules"}
          </div>
          {!results.length && (
            <div className="nav-search-empty">
              {lang === "bn"
                ? "কোনো মডিউল পাওয়া যায়নি"
                : "No matching modules found"}
            </div>
          )}
          {results.map((item, index) => (
            <button key={item.href}
              type="button"
              className={
                index === active
                  ? "nav-search-result active"
                  : "nav-search-result"
              }
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(item.href)}>
              <span className="nav-search-result-label">
                <strong>{lang === "bn" ? item.bn : item.en}</strong>
                <small>{item.section}</small>
              </span>
              <ArrowRight size={15}/>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
