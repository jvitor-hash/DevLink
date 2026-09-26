import Input from "@/components/form/input_component";
import type { UserDTO } from "@/data/types/database";

type SettingsProfileProps = {
    user: UserDTO
    onChange: (e) => void
}

export default function SettingsProfile({ user, onChange }: SettingsProfileProps) {
    return (
        <>
            <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-6">
                <h2 className="mb-4 text-xl font-semibold">Perfil</h2>

                <div className="flex flex-col gap-6 sm:flex-row">
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="mb-2 block text-sm text-(--text-muted)">Nome</label>
                            <Input
                                label=""
                                name="settings-name"
                                inputType="text"
                                value={user.name}
                                onChange={(e) => onChange({ name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-(--text-muted)">E-mail</label>
                            <p className="rounded-md border border-(--border-subtle) bg-(--surface-2) p-3 text-(--text-muted)">
                                {user.email}
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-(--text-muted)">Bio</label>
                            <Input
                                label=""
                                name="settings-bio"
                                inputType="text"
                                placeholder="Conte um pouco sobre você..."
                                value={user.bio ?? ""}
                                onChange={(e) => onChange({ bio: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        {user.image ? (
                            <img
                                src={user.image}
                                alt="Avatar"
                                className="h-20 w-20 rounded-full border border-(--border-subtle) object-cover"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-(--border-subtle) bg-(--surface-2) text-2xl font-bold text-(--text-muted)">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <Input
                            label=""
                            name="settings-image"
                            inputType="text"
                            placeholder="URL da foto"
                            value={user.image ?? ""}
                            onChange={(e) => onChange({ image: e.target.value })}
                        />
                    </div>
                </div>
            </section>
        </>
    )
}