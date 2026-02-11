export function LoadingSpinner({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    default: "h-10 w-10 border-4",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div className="flex items-center justify-center h-full p-10">
      <div
        className={`animate-spin rounded-full border-t-primary border-b-primary border-r-transparent border-l-transparent ${sizeClasses[size]}`}
      ></div>
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
}
