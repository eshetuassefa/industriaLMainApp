## 🚦 Routing System

### Router Configuration (`src/router.tsx`)

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import NotFound from './pages/NotFound';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/admin/Dashboard';
import AuthGuard from './components/auth/AuthGuard';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import UserManagement from './pages/superadmin/UserManagement';

export const router = createBrowserRouter([
    {
        path: "*",
        element: <NotFound />, 
    },
    {
        path: "/admin/dashboard",
        element: (
            <AdminLayout> {/* Role-based layout wrapper */}
                <DashboardPage />
            </AdminLayout>
        ),
    },
    {
        path: "/superadmin/users",
        element: (
            <AuthGuard roles={['superadmin']}>
                <SuperAdminLayout>
                    <UserManagement />
                </SuperAdminLayout>
            </AuthGuard>
        ),
    },
]);
```

### Route Organization Guide

#### Page Components
- Place page components in `src/pages/[role]/` folders.
- **Example:** `src/pages/admin/Dashboard.tsx`

#### Layouts
- Use role-specific layouts in `src/layouts/`.
- Wrap pages with the appropriate layout component.

#### Route Protection
- Implement route guards for role-based access control.

```tsx
// Example protected route
{
    path: "/superadmin/users",
    element: (
        <AuthGuard roles={['superadmin']}>
            <SuperAdminLayout>
                <UserManagement />
            </SuperAdminLayout>
        </AuthGuard>
    )
}
```

---

## 🗂 Folder Structure Conventions

### Key Directories

| Directory      | Purpose                                                   |
|----------------|-----------------------------------------------------------|
| `layouts/`     | Wrapper components for different user roles (Admin, etc.) |
| `pages/`       | Page components grouped by user role/functionality        |
| `services/`    | API clients and service layer implementation              |
| `store/`       | Global state management (e.g., Zustand/Redux stores)      |
| `components/`  | Reusable UI components (prefix with domain, e.g., `PatientCard.tsx`) |

---

## Best Practices

### 🗃 Route Organization
- Use **lazy loading** for better performance.

```tsx
const DashboardPage = lazy(() => import('./pages/admin/Dashboard'));
```

### 🔐 Auth Integration
- Implement route guards in `src/components/auth/`.
- Use role validation middleware for secure access.

### ⚠️ Error Handling
- Maintain error boundaries in layouts.
- Use shared error components from `src/components/errors/`.
