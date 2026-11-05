export default function TeamMembersCard(props: { team_member_name: string, team_member_role: string }) {
    return (
        <>
            <li className="border-b border-(--border-subtle) py-5 relative">
              <div className="flex flex-col">
                <h4 className="text-lg z-10">{props.team_member_name}</h4>
                <p className="mt-2 text-sm z-10">{props.team_member_role}</p>

                <span 
                    className="absolute 
                        mask-[linear-gradient(to_left,white_35%,transparent_100%)] 
                        halftone h-[70%] w-full 
                        text-(--primary) z-0" 
                    aria-hidden="true" />
              </div>
            </li>
        </>
    )
}