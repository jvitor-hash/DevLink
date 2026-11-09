import React from "react";

type StepsComponentProps = {
  currentStep: number;
  children?: React.ReactNode;
  className?: string;
};

type StepsItemComponentType = {
  step: number;
  currentStep?: number;
  isLast?: boolean;
  children: React.ReactNode;
  className?: string;
};

type StepsIndicatorComponentType = {
  step?: number;
  currentStep?: number;
  completed?: boolean;
  current?: boolean;
  className?: string;
};

const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export function Steps({
  currentStep,
  children,
  className = "",
}: StepsComponentProps) {
  const items = React.Children.toArray(children);

  return (
    <nav
      aria-label="Progress"
      className={cn("flex w-full", className)}
    >
      {items.map((child, index) => {
        if (!React.isValidElement(child)) {
          console.warn(`Non-ReactElement child found at index ${index}`);
          return null;
        }

        return React.cloneElement(
          child as React.ReactElement<StepsItemComponentType>,
          {
            currentStep,
            isLast: index === items.length - 1,
          }
        );
      })}
    </nav>
  );
}

Steps.Item = function StepsItem({
  step,
  currentStep,
  isLast = false,
  children,
  className = "",
}: StepsItemComponentType) {
  const completed =
    currentStep !== undefined && step < currentStep;

  const current =
    currentStep !== undefined && step === currentStep;

  const childItems = React.Children.toArray(children);

  return (
    <div
      className={cn(
        "relative flex flex-1 items-start",
        !isLast &&
          "after:absolute after:left-1/2 after:right-[-50%] after:top-5 after:h-0.5",
        completed
          ? "after:bg-(--error)"
          : "after:bg-(--surface-2)",
        className
      )}
    >
      <div className="relative z-10 flex w-full flex-col items-center">
        {childItems.map((child, index) => {
          if (!React.isValidElement(child)) {
            return null;
          }

          return React.cloneElement(
            child as React.ReactElement<StepsIndicatorComponentType>,
            {
              key: child.key ?? index,
              step,
              currentStep,
              completed,
              current,
            }
          );
        })}
      </div>
    </div>
  );
};

Steps.Indicator = function StepsIndicator({
  step,
  completed = false,
  current = false,
  className = "",
}: StepsIndicatorComponentType) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded",
        "text-sm transition-colors",
        completed &&
          "border-(--primary) bg-(--primary) text-white",
        current &&
          !completed &&
          "border-(--surface-2) bg-white text-(--primary)",
        !completed &&
          !current &&
          "bg-white text-gray-500",
        className
      )}
    >
      {completed ? "✓" : step}
    </div>
  );
};
