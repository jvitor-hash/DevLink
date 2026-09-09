import { useEffect, useState } from "react";
import { authService } from "@/services/auth_service";
import type { UserDTO } from "@/lib/types/database";

export default function SettingsPage() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const cachedUser = authService.getCachedUser();
      if (cachedUser) {
        setUser(cachedUser);
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-white">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Configurações</h1>

      <div className="bg-(--surface-1) rounded-lg p-6 border border-(--border-subtle)">
        <h2 className="text-xl font-semibold text-white mb-4">Perfil</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Nome</label>
            <p className="text-white">{user.name}</p>
          </div>

          <div>
            <label className="block text-white mb-2">E-mail</label>
            <p className="text-white">{user.email}</p>
          </div>

          {user.role && (
            <div>
              <label className="block text-white mb-2">Tipo de usuario:</label>
              <p className="text-white capitalize">{user.role.toLowerCase()}</p>
            </div>
          )}

          {user.bio && (
            <div>
              <label className="block text-white mb-2">Bio</label>
              <p className="text-white">{user.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
