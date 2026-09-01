import { useEffect, useState } from 'react';
import type { Usuario, Projeto } from '../modules/interfaces';
import API from '../modules/api';

export default function APIPlayground() {
  const [users, setUsers] = useState<Usuario[] | null>(null);
  const [projects, setProjects] = useState<Projeto[] | null>(null);

    useEffect(() => {
      const fetchUsers = async () => {
          const users = await API.get<Usuario[]>("/api/usuario/");

          if (!users)
              throw new Error("Erro ao trazer dados dos usuarios");

          setUsers(users);
      }

      const fetchProjects = async () => {
        const projects = await API.get<Projeto[]>("/api/projeto");

        if (!projects)
          throw new Error("Erro ao trazer dados dos projetos");

        setProjects(projects);
      }

      fetchUsers();
      fetchProjects();
    }, []);
	
  return (
        <>
            <section className="grid grid-rows-auto grid-cols-6 gap-5">
            {users !== null && users.map((user) => (
                <div className="dark:text-white" key={user.id}>
                  <p>{user.id}</p>
                  <p>{user.name}</p>
                  <p>{user.email}</p>
                  <p>{user.platforms}</p>
                  <p>{user.description}</p>
                  <p>{user.userType}</p>
                </div>
            ))}
            </section>

            <section>
            {projects !== null && projects.map((project) => (
              <div className="dark:text-white" key={project.id}>
                  <p>{project.id}</p>
                  <p>{project.title}</p>
                  <p>{project.category}</p>
                  <p>{project.subcategory}</p>
                  <p>{project.problem}</p>
                  <p>{project.audience}</p>
                  <p>{project.platforms}</p>
                  <p>{project.language}</p>
                  <p>{project.internetAccess}</p>
                  <p>{project.adminPanel}</p>
              </div>
            ))}
            </section>
        </>
    )
}
    
