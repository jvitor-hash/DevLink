import { ReactNode } from "react"

type LinkListProps = {
  children: ReactNode
}

export default function LinkList({ children }: LinkListProps) {
  return (
    <div className="border border-t-(--primary) border-b-(--primary) py-4
      flex items-center justify-around *:hover:text-(--primary) *:transition-colors">
      {children}
    </div>
  )
}
