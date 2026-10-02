// Shown while a lazily loaded route chunk is still being fetched.
export default function RouteFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <p className="text-base text-(--text-primary)">Carregando...</p>
    </div>
  );
}
