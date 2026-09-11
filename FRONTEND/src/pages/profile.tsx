import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "@/components/ui/button_component";
import { authService } from "@/services/auth_service";
import { reviewService } from "@/services/review_service";
import type { UserDTO, ReviewDTO } from "@/lib/types/database";
import ProfileCard from "@/components/layout/profile_card_layout";

export default function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();

  const [profileUser, setProfileUser] = useState<UserDTO | null>(null);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const cached = authService.getCachedUser();
        const targetId = userId ?? cached?.id;

        if (!targetId) {
          setError("Usuário não encontrado.");
          return;
        }

        const user = targetId === cached?.id ? cached : (await authService.getCurrentUser());

        if (!user || user.id !== targetId) {
          setError("Perfil não encontrado.");
          return;
        }

        setProfileUser(user);

        if (user.role === "PROGRAMMER") {
          const received = await reviewService.listReceivedByUser(targetId);
          setReviews(Array.isArray(received) ? received.map((item) => item.review) : []);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o perfil.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="p-8 text-white">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-(--error)">{error}</p>
      </div>
    );
  }

  if (!profileUser) {
    return null;
  }

  const isOwnProfile = authService.getCachedUser()?.id === profileUser.id;
  // const isProgrammer = profileUser.role === "PROGRAMMER";

  return (


    <div className="p-8">
      <header className="mb-8">
        <div className="flex items-center gap-4">
          <ProfileCard
            name={profileUser.name}
            bio={profileUser.bio}
            role={profileUser.role}
            connections={500}
          />
        </div>

        {!isOwnProfile && (
          <div className="mt-4">
            <Button label="Ver projetos" colorType="primary" buttonType="button" href={`/project?ownerId=${profileUser.id}`} />
          </div>
        )}
      </header>


    </div>
  );
}
