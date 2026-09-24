import type { UserDTO } from "@/lib/types/database"

type SettingsAccountProps = {
    user: UserDTO
}

export default function SettingsAccount({ user }: SettingsAccountProps) {
    return (
        <>
            <section className="rounded-md border border-(--border-subtle) bg-(--surface-1) p-6">
                <h2 className="mb-4 text-xl font-semibold">Conta</h2>

                <div className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm text-(--text-muted)">E-mail</label>
                        <p>{user.email}</p>
                    </div>

                    {user.role && (
                        <div>
                            <label className="mb-2 block text-sm text-(--text-muted)">Tipo de usuário</label>
                            <p className="capitalize">{user.role.toLowerCase()}</p>
                        </div>
                    )}

                    {user.createdAt && (
                        <div>
                            <label className="mb-2 block text-sm text-(--text-muted)">Membro desde</label>
                            <p>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}