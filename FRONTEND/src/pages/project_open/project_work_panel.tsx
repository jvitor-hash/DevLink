import { useState } from "react";
import { Box, Calendar, CheckCircle, MessageSquare, Paperclip } from "react-feather";
import { authService } from "@/services/auth_service";
import type { TicketDTO, TicketStatus, TodoDTO } from "@/lib/types/database";
import ProgressBar from "@/components/ui/segmented_progress_bar_component";
import Checkbox from "@/components/ui/checkbox_component";
import Badge from "@/components/ui/badge_component";
import Card from "@/components/ui/card_component";

const KANBAN_COLUMNS: ReadonlyArray<{ item: string, translated: string}> = [
  { item: "BACKLOG",     translated: "Backlog"      },
  { item: "IN_PROGRESS", translated: "Em andamento" },
  { item: "REVIEW",      translated: "Validação"    },
  { item: "DONE",        translated: "Finalizado"   },
];

type ProjectWorkPanelProps = {
  projectId: string;
};

type testticket = {
  title: string
  category: string
  priority: "low" | "med" | "high"
  date: Date
}

export default function ProjectWorkPanel({ projectId }: ProjectWorkPanelProps) {
  // TODO: Handle error when rendering
  const [error, setError] = useState<string | null>(null);
  const [kanbanTickets, setKanbanTickets] = useState<testticket[] | null>(null);

  const currentUserId = authService.getCachedUser()?.id;

  // const progressPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)

  // setKanbanTickets([
  //   { title: "ticket-1", category: "test-1", date: new Date().getDate(), priority: "med" }
  // ]);

  // User types into the <input> and presses enter the TODO/checklist item is created
  const insertCheck = () => {};
  const completeCheck = () => { };
  const deleteCheck = () => { };

  // User drags tickets around they snap to the closest column
  const moveTicket = () => { };
  const deleteTicket = () => { };

  return (
    <>
      <div className="border border-(--border-subtle) rounded-md bg-(--surface-1) p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">Progresso:</span>
          <ProgressBar progress={50} segments={40} />
        </div>

        <div className="flex gap-2">
          <section className="flex-1 border-r border-(--border)">
            <header className="flex items-center gap-2">
              <CheckCircle size={16} color="var(--text-primary)" />
              <span>Checklist</span>
            </header>

            <main className="flex flex-col gap-2 mt-2">
              <div className="flex gap-2">
                <Checkbox label=""/>
                <input className="appearance-none outline-none border-none text-(--text-secondary) flex-1" placeholder="Criar documentação do projeto"></input>
              </div>
            </main>
          </section>

          <section className="flex-4 h-full max-h-180">
            <header className="flex items-center gap-2 mb-2">
              <Box size={18} color="var(--text-primary)" />
              Board
            </header>

            <main className="flex justify-between *:flex-1 gap-2">
              {KANBAN_COLUMNS.map((column) => (
                <div className="border border-(--border-subtle) bg-(--surface-2) flex flex-col rounded-sm p-2">
                  <div className="mb-2">
                    {column.translated}
                  </div>

                  {/*{kanbanTickets !== null && kanbanTickets.map((ticket) => (
                    <div></div>
                  ))}*/}

                  <Card className="flex flex-col gap-2 border border-(--border) shadow-md bg-(--surface-3) mx-1 rounded-md p-4">
                    <div className="flex gap-2">
                      <Badge label="Category" badgeType="secondary" />
                      <Badge label="🏴 Priority" badgeType="secondary" />
                    </div>

                    <div>
                      <h4 className="text-xl">Kanban Card Title</h4>
                      <h6 className="text-md text-(--text-secondary)">Card Subtitle</h6>
                    </div>

                    <div className="">
                      {/* Users assigned */}
                      <div className="flex gap-1">
                        <div></div>
                      </div>
                      {/* Date */}
                      <div className="flex items-center gap-1 border-r border-(--border-subtle)">
                        <Calendar size={14} color="var(--text-secondary)"/>
                        <span className="text-(--text-secondary)">25-09-2026</span>
                      </div>

                      {/* Attachments & Messages */}
                      <div className="flex items-center gap-1">
                        <Paperclip size={14} color="var(--text-secondary)" />
                        <span className="text-(--text-secondary)">00</span>
                        <MessageSquare size={14} color="var(--text-secondary)" />
                        <span className="text-(--text-secondary">00</span>
                      </div>
                    </div>
                  </Card>

                  <button
                  type="button"
                  className="border border-dashed
                  p-2 rounded-sm mx-2 hover:cursor-pointer
                  transition-colors hover:bg-(--surface-3)/65">+</button>
                </div>
              ))}
            </main>
          </section>
        </div>
      </div>
    </>
  );
}
