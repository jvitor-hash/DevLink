# AGENTS.md / FRONTEND

## Project Overview

This is a modern frontend project based on React 19, TypeScript, and Vite. It's suitable for building high-performance Single Page Applications (SPA) with integrated modern development toolchain and best practices.

## Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: react-dom-router
- **Styling**: Tailwind CSS / Styled-components
- **Code Quality**: ESLint

## Project Structure

FRONTEND/
├── AGENTS.md
├── eslint.config.js
├── index.html
├── package.json
├── public             # Static assets
│   ├── favicon.svg
│   └── icons.svg
├── src
│   ├── components
│   │   ├── layout     # Components that are reusable but not modular
│   │   ├── misc       # Doesn't fit within any other category
│   │   ├── shaders    # Stores WebGL shaders
│   │   ├── types      # Types/Interfaces
│   │   └── ui         # Modular components can be reused anywhere
│   ├── global.css
│   ├── lib
│   │   ├── hooks      # Custom hooks
│   │   ├── types      # Database type definitions
│   │   └── utils      # Helper functions
│   ├── main.tsx       # Root
│   ├── pages
│   │   ├── error.tsx  # ErrorBoundary page
│   │   ├── home.tsx
│   │   ├── notification.tsx
│   │   ├── profile.tsx
│   │   ├── project.tsx
│   │   ├── questionnaire.tsx
│   │   └── settings.tsx
│   └── services
│       ├── api_client.ts     # Generic HTTP request helper
│       ├── auth_service.ts 
│       ├── message_service.ts
│       ├── notification_service.ts
│       ├── project_service.ts
│       ├── review_service.ts
│       ├── saved_ticket_service.ts
│       └── user_preference_service.ts
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

## Environment Setup

- **Bun**: >= 1.4.2
- **Package Manager**: bun (all npm packages installation must use `bun add`)

## Component Development Standards

1. **Function Components First**: Use function components and Hooks
2. **TypeScript Types**: Define interfaces for all props
3. **Component Naming**: Use PascalCase, file name matches component name
4. **Single Responsibility**: Each component handles only one functionality

```tsx
// Example: Button Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size = 'medium',
  disabled = false,
  onClick,
  children
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

## API Service Standards

```tsx
// services/project_service.ts
import type { PaginationParams, ProjectCreate, ProjectDTO, ProjectUpdate } from "@/lib/types/database";
import { apiClient } from "./api_client";

const endpoint = "/api/v1/projects";

export const projectService = {
  create: (data: ProjectCreate) => apiClient.post<ProjectDTO>(endpoint, data),
  list: (params?: Pick<PaginationParams, "limit" | "offset">) => apiClient.get<ProjectDTO[]>(endpoint, params),
  getById: (id: string) => apiClient.get<ProjectDTO>(`${endpoint}/${id}`),
  update: (id: string, data: ProjectUpdate) => apiClient.put<ProjectDTO>(`${endpoint}/${id}`, data),
  remove: (id: string) => apiClient.delete<ProjectDTO>(`${endpoint}/${id}`),
};
```

## Performance Optimization

### Code Splitting

```tsx
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Memory Optimization

```tsx
import { memo, useMemo, useCallback } from 'react';

const ExpensiveComponent = memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }));
  }, [data]);

  const handleUpdate = useCallback((id) => {
    onUpdate(id);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleUpdate(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
});
```

## Boundaries

- Leave the UI unchanged; only do the plumbing of the API with the UI.

### Issue 1: TypeScript Type Errors
**Solution**:
- Ensure correct type definition packages are installed
- Use `bun run type-check` for type checking

## Reference Resources

- [React Official Documentation](https://react.dev/)
- [Vite Official Documentation](https://vitejs.dev/)
- [TypeScript Official Documentation](https://www.typescriptlang.org/)
- [Bun Official Documentation](https://bun.com)
