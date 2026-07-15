import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './ui/AppShell.jsx';
import { ProtectedRoute } from './ui/ProtectedRoute.jsx';
import { Landing } from './views/Landing.jsx';
import { AuthPage } from './views/AuthPage.jsx';
import { AdminDashboard } from './views/dashboards/AdminDashboard.jsx';
import { InstructorDashboard } from './views/dashboards/InstructorDashboard.jsx';
import { StudentDashboard } from './views/dashboards/StudentDashboard.jsx';
import { Courses } from './views/Courses.jsx';
import { CourseDetail } from './views/CourseDetail.jsx';
import { Playground } from './views/Playground.jsx';
import { CertificatePortal } from './views/CertificatePortal.jsx';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/courses', element: <Courses /> },
      { path: '/courses/:courseId', element: <CourseDetail /> },
      { path: '/playground', element: <Playground /> },
      { path: '/dashboard', element: <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute> },
      { path: '/dashboard/user', element: <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute> },
      { path: '/dashboard/student', element: <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute> },
      { path: '/dashboard/instructor', element: <ProtectedRoute allowedRoles={['instructor']}><InstructorDashboard /></ProtectedRoute> },
      { path: '/dashboard/admin', element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute> },
      { path: '/certificates', element: <CertificatePortal /> },
      { path: '/login', element: <AuthPage mode="login" /> },
      { path: '/signup', element: <AuthPage mode="signup" /> },
    ],
  },
]);
