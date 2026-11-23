export default function LoadingScreen() {
  return (
    <div className="grid place-items-center min-h-[60vh] w-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-(--primary) border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-(--text-muted)">Carregando...</p>
      </div>
    </div>
  );
}
