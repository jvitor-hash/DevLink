import { useState, useRef, useEffect } from 'react';

// Tooltip component
const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 200,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  // Position classes for the tooltip container
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Arrow classes based on position
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-surface-3 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-surface-3 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-surface-3 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-surface-3 border-y-transparent border-l-transparent',
  };

  // Show tooltip with delay
  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  // Hide tooltip immediately
  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative inline-block">
      {/* Trigger element */}
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        tabIndex={0}
        aria-describedby={isVisible ? 'tooltip' : undefined}
        className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        {children}
      </div>

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          id="tooltip"
          className={`
            absolute z-50 px-3 py-1.5 rounded-md
            bg-surface-3 text-text-primary text-sm font-medium
            whitespace-nowrap shadow-lg
            border border-border-subtle
            pointer-events-none
            animate-in fade-in duration-150
            ${positionClasses[position]}
            ${className}
          `}
        >
          {content}
          {/* Arrow */}
          <span
            className={`
              absolute w-0 h-0 border-[6px]
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
};

// Demo App to showcase the tooltip
const App = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-10 p-10 font-sans">
      <h1 className="text-2xl font-semibold text-text-primary mb-4">
        React Tooltip Component
      </h1>

      <div className="flex flex-wrap gap-6 justify-center">
        <Tooltip content="I'm on top!" position="top">
          <button className="px-5 py-2.5 bg-surface-2 text-text-primary rounded-lg border border-border hover:bg-surface-3 transition-colors">
            Top Tooltip
          </button>
        </Tooltip>

        <Tooltip content="I'm on the bottom!" position="bottom">
          <button className="px-5 py-2.5 bg-surface-2 text-text-primary rounded-lg border border-border hover:bg-surface-3 transition-colors">
            Bottom Tooltip
          </button>
        </Tooltip>

        <Tooltip content="I'm on the left!" position="left">
          <button className="px-5 py-2.5 bg-surface-2 text-text-primary rounded-lg border border-border hover:bg-surface-3 transition-colors">
            Left Tooltip
          </button>
        </Tooltip>

        <Tooltip content="I'm on the right!" position="right">
          <button className="px-5 py-2.5 bg-surface-2 text-text-primary rounded-lg border border-border hover:bg-surface-3 transition-colors">
            Right Tooltip
          </button>
        </Tooltip>
      </div>

      <div className="flex flex-wrap gap-6 justify-center mt-4">
        <Tooltip content="This tooltip has a 1s delay" position="top" delay={1000}>
          <button className="px-5 py-2.5 bg-primary text-text-primary rounded-lg hover:opacity-90 transition-opacity">
            Slow Tooltip (1s)
          </button>
        </Tooltip>

        <Tooltip
          content="Custom styled tooltip"
          position="bottom"
          className="bg-info text-background font-semibold border-none"
        >
          <button className="px-5 py-2.5 bg-info text-background rounded-lg hover:opacity-90 transition-opacity">
            Custom Style
          </button>
        </Tooltip>

        <Tooltip content="Success message" position="top">
          <button className="px-5 py-2.5 bg-success text-text-primary rounded-lg hover:opacity-90 transition-opacity">
            Success
          </button>
        </Tooltip>

        <Tooltip content="Warning message" position="top">
          <button className="px-5 py-2.5 bg-warning text-background rounded-lg hover:opacity-90 transition-opacity">
            Warning
          </button>
        </Tooltip>

        <Tooltip content="Error message" position="top">
          <button className="px-5 py-2.5 bg-error text-text-primary rounded-lg hover:opacity-90 transition-opacity">
            Error
          </button>
        </Tooltip>
      </div>

      <p className="text-text-muted text-sm text-center max-w-lg mt-8">
        Hover or focus on the buttons to see the tooltips. Supports four positions,
        custom delays, and custom styling through Tailwind classes.
      </p>
    </div>
  );
};

export default App;
