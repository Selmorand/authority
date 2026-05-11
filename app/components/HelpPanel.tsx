"use client";

import { useState, useRef, useEffect } from "react";
import { helpContent, HelpEntry } from "@/data/helpContent";

export default function HelpPanel() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<HelpEntry | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        if (selected) {
          setSelected(null);
        } else {
          setOpen(false);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selected]);

  const q = query.toLowerCase().trim();
  const results = q.length === 0
    ? helpContent
    : helpContent.filter(
        (entry) =>
          entry.title.toLowerCase().includes(q) ||
          entry.summary.toLowerCase().includes(q) ||
          entry.keywords.some((k) => k.includes(q)) ||
          entry.category.toLowerCase().includes(q)
      );

  const categories = [...new Set(results.map((r) => r.category))];

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 w-11 h-11 rounded-full bg-accent text-background font-bold text-lg shadow-lg hover:bg-accent/80 transition-colors cursor-pointer flex items-center justify-center"
        title="Help (Ctrl+/)"
      >
        ?
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[10vh]"
          onClick={() => { setOpen(false); setSelected(null); setQuery(""); }}
        >
          <div
            className="bg-background-raised border border-card-border-subtle rounded-xl shadow-2xl w-full max-w-2xl max-h-[75vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search */}
            <div className="p-4 border-b border-card-border-subtle">
              <div className="flex items-center gap-3">
                <span className="text-accent text-lg font-bold">?</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
                  placeholder="Search help... (e.g. missions, drift, AI visibility)"
                  className="flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted"
                />
                <span className="text-xs text-muted hidden sm:block">Ctrl+/ to toggle</span>
                <button
                  onClick={() => { setOpen(false); setSelected(null); setQuery(""); }}
                  className="text-muted hover:text-foreground text-sm cursor-pointer"
                >
                  ESC
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-4">
              {selected ? (
                /* Detail View */
                <div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xs text-accent hover:text-accent/80 cursor-pointer mb-3"
                  >
                    &larr; Back to results
                  </button>
                  <div className="mb-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-accent/15 text-accent">
                      {selected.category}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground-bright mb-3">
                    {selected.title}
                  </h2>
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {selected.details.split("\n").map((line, i) => {
                      const trimmed = line.trim();
                      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
                        return (
                          <p key={i} className="font-bold text-foreground-bright mt-3 mb-1">
                            {trimmed.replace(/\*\*/g, "")}
                          </p>
                        );
                      }
                      if (trimmed.startsWith("- **")) {
                        const match = trimmed.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
                        if (match) {
                          return (
                            <p key={i} className="ml-3 mb-0.5">
                              <span className="text-accent mr-1">&#8226;</span>
                              <span className="font-semibold text-foreground-bright">{match[1]}</span>
                              {match[2] && <span className="text-foreground">: {match[2]}</span>}
                            </p>
                          );
                        }
                      }
                      if (trimmed.startsWith("- ")) {
                        return (
                          <p key={i} className="ml-3 mb-0.5">
                            <span className="text-accent mr-1">&#8226;</span>
                            {trimmed.slice(2)}
                          </p>
                        );
                      }
                      if (trimmed === "") return <div key={i} className="h-2" />;
                      return <p key={i} className="mb-1">{trimmed}</p>;
                    })}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-8 text-muted text-sm">
                  No results found for &quot;{query}&quot;. Try a different search term.
                </div>
              ) : (
                /* Results List */
                categories.map((cat) => (
                  <div key={cat} className="mb-4">
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                      {cat}
                    </h3>
                    <div className="space-y-1">
                      {results
                        .filter((r) => r.category === cat)
                        .map((entry) => (
                          <button
                            key={entry.id}
                            onClick={() => setSelected(entry)}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground-bright group-hover:text-accent transition-colors">
                                {entry.title}
                              </span>
                              <span className="text-xs text-muted">&rarr;</span>
                            </div>
                            <p className="text-xs text-muted mt-0.5 line-clamp-1">
                              {entry.summary}
                            </p>
                          </button>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
