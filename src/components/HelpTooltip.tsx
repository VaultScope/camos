import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { X, ExternalLink, Info } from 'lucide-react';

interface ExplainModeContextType {
  explainMode: boolean;
  toggleExplainMode: () => void;
}

const ExplainModeContext = createContext<ExplainModeContextType>({
  explainMode: false,
  toggleExplainMode: () => {},
});

export const useExplainMode = () => useContext(ExplainModeContext);

export const ExplainModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [explainMode, setExplainMode] = useState<boolean>(() => {
    return localStorage.getItem('camos_explain_mode') === 'true';
  });

  const toggleExplainMode = () => {
    setExplainMode(prev => {
      const next = !prev;
      localStorage.setItem('camos_explain_mode', String(next));
      return next;
    });
  };

  return (
    <ExplainModeContext.Provider value={{ explainMode, toggleExplainMode }}>
      {children}
    </ExplainModeContext.Provider>
  );
};

export interface HelpTooltipProps {
  title?: string;
  content: React.ReactNode;
  badge?: string;
  example?: string;
  docUrl?: string;
  size?: 'sm' | 'md';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
}

export function HelpTooltip({
  title,
  content,
  badge,
  example,
  docUrl,
  size = 'sm',
  position = 'top',
  className = '',
  children,
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { explainMode } = useExplainMode();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!isPinned) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 150);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsPinned(prev => !prev);
    setIsOpen(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsPinned(false);
    setIsOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen && !isPinned) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsPinned(false);
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPinned(false);
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isPinned]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position];

  return (
    <span
      className={`relative inline-flex items-center align-middle ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        aria-label={title || "Information"}
        className={`inline-flex items-center justify-center transition-all cursor-pointer rounded-full select-none ${
          size === 'sm' ? 'w-4 h-4 text-[10px]' : 'w-5 h-5 text-xs'
        } ${
          isPinned || isOpen
            ? 'bg-foreground text-background shadow-md'
            : explainMode
            ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40 ring-2 ring-amber-500/20 animate-pulse'
            : 'bg-foreground/10 text-muted-foreground hover:bg-foreground/20 hover:text-foreground'
        }`}
      >
        {children || <span className="font-semibold leading-none">?</span>}
      </button>

      {(isOpen || isPinned) && (
        <div
          ref={popoverRef}
          role="tooltip"
          className={`absolute z-50 w-72 max-w-xs p-3.5 bg-background border border-border shadow-xl rounded-lg text-left text-foreground animate-in fade-in-0 zoom-in-95 duration-150 ${positionClasses}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {title && <h4 className="text-xs font-semibold tracking-tight text-foreground">{title}</h4>}
              {badge && (
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-foreground/10 text-muted-foreground">
                  {badge}
                </span>
              )}
            </div>
            {isPinned && (
              <button
                type="button"
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-foreground/10 cursor-pointer"
                aria-label="Close tooltip"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="text-xs text-muted-foreground leading-relaxed font-normal">
            {content}
          </div>

          {example && (
            <div className="mt-2.5 pt-2 border-t border-border/50">
              <span className="text-[10px] font-medium text-foreground/50 uppercase tracking-wider block mb-0.5">Example / Format</span>
              <code className="text-[11px] font-mono text-foreground/80 bg-foreground/5 px-1.5 py-0.5 rounded block truncate">
                {example}
              </code>
            </div>
          )}

          {docUrl && (
            <div className="mt-2.5 pt-2 border-t border-border/50 flex justify-end">
              <a
                href={docUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-foreground hover:underline font-medium"
              >
                Documentation <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          )}

          {isPinned && (
            <div className="mt-2 text-[9px] text-muted-foreground/60 italic text-right">
              Pinned (click anywhere outside to close)
            </div>
          )}
        </div>
      )}
    </span>
  );
}
