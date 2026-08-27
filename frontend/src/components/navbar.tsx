import { Link } from "react-router-dom";
import ThemeToggle from "../components/theme_toggle";

function Navbar() {
  return (
    <div className="navbar sticky top-0 bg-neutral-100 dark:bg-neutral-800 dark:text-white shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <i className="bi bi-list text-xl"></i>
          </div>
          <ul tabIndex={1} className="menu menu-md rounded-sm dropdown-content bg-neutral-100 dark:bg-neutral-700 text-base z-1 mt-3 w-50 p-4 gap-1 shadow">
            <li><Link to="/" className="hover:bg-white/5">Home</Link></li>
            <li><Link to="/questionarion" className="hover:bg-white/5">Questionario</Link></li>
          </ul>
        </div>
      </div>

      <div className="navbar-center">
        <Link to="/" className="btn btn-ghost text-xl">DevLink</Link>
      </div>

      <div className="navbar-end gap-2">
        <button type="button" className="btn btn-link text-black dark:text-white h-auto py-1.5 px-1"><i className="bi bi-bell text-xl"></i></button>
        <ThemeToggle />
        <button type="button" className="btn btn-outline btn-primary border-sky-500 h-auto px-4 py-1.5">Login</button>
      </div>
    </div>
  )
}

export default Navbar;
