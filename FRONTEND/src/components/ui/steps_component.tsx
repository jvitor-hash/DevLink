import React from "react";

const cn = (...classes) => classes.filter(Boolean).join("");

export function Steps({ currentStep, children, className = "" }) {
  return (
    <nav aria-label="Progress" className={cn("flex w-full", className)}>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          step: index + 1,
          currentStep,
          isLast: index === React.Children.count(children) - 1,
        })
      )}
    </nav>
  );
}

Steps.Item = function StepsItem({ step, currentStep, isLast, children, className = "" }) {
  const completed = step < currentStep;
  const current = step === currentStep;

  return (
    <div
      className={cn(
        "relative flex flex-1 items-start",
        !isLast &&
          "after:absolute after:left-1/2 after:right-0 after:top-5 after:h-0.5",
        completed || current ? "after:bg-(--surface-3)" : "after:bg-(--surface-2)",
        className
      )}
    >
      <div className="relative z-10 flex w-full flex-col items-center">
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            step,
            currentStep,
            completed,
            current,
          })
        )}
      </div>
    </div>
  );
};

Steps.Indicator = function StepsIndicator({ step, completed, current, className = "" }) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border-2",
        "text-sm transition-colors",
        completed && "border bg-(--primary) text-white",
        current && !completed && "border-(--surface-2) bg-white text-(--primary)",
        !completed &&
          !current &&
          "border-gray-300 bg-white text-gray-500",
        className
      )}
    >
      {completed ? "✓" : step}
    </div>
  );
};