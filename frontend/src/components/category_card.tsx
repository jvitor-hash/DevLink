import { Link } from "react-router-dom";

type CategoryLink = {
  label: string
  to: string
}

type CategoryCardProps = {
  title: string
  links: CategoryLink[]
}

function CategoryCard({ title, links }: CategoryCardProps) {
  return (
    <div className="card bg-base-200 dark:bg-neutral-800 shadow-sm border border-black/15 p-4">
      <div className="card-title">
        <h5 className="font-bold dark:text-white">{title}</h5>
      </div>

      <div className="card-body dark:text-white">
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="block"><i className="bi bi-chevron-right me-1"></i>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CategoryCard;
