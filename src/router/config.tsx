
import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const Home = lazy(() => import('../pages/home/page'));
const Login = lazy(() => import('../pages/login/page'));
const Register = lazy(() => import('../pages/register/page'));
const Dashboard = lazy(() => import('../pages/dashboard/page'));
const NewMoveInCard = lazy(() => import('../pages/move-in-card/new/page'));
const MoveInCardDetail = lazy(() => import('../pages/move-in-card/detail/page'));
const EditMoveInCard = lazy(() => import('../pages/move-in-card/edit/page'));
const Admin = lazy(() => import('../pages/admin/page'));
const AdminNotices = lazy(() => import('../pages/admin/notices/page'));
const AdminNewMoveInCard = lazy(() => import('../pages/admin/move-in-card/new/page'));
const AdminComplaints = lazy(() => import('../pages/admin/complaints/page'));
const Notices = lazy(() => import('../pages/notices/page'));
const NoticeDetail = lazy(() => import('../pages/notices/detail/page'));
const Complaints = lazy(() => import('../pages/complaints/page'));
const NewComplaint = lazy(() => import('../pages/complaints/new/page'));
// const ComplaintDetail = lazy(() => import('../pages/complaints/detail/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/move-in-card/new',
    element: <NewMoveInCard />,
  },
  {
    path: '/move-in-card/:id',
    element: <MoveInCardDetail />,
  },
  {
    path: '/move-in-card/edit/:id',
    element: <EditMoveInCard />,
  },
  {
    path: '/admin',
    element: <Admin />,
  },
  {
    path: '/admin/notices',
    element: <AdminNotices />,
  },
  {
    path: '/admin/move-in-card/new',
    element: <AdminNewMoveInCard />,
  },
  {
    path: '/admin/complaints',
    element: <AdminComplaints />,
  },
  {
    path: '/notices',
    element: <Notices />,
  },
  {
    path: '/complaints',
    element: <Complaints />,
  },
  {
    path: '/complaints/new',
    element: <NewComplaint />,
  },
  // {
  //   path: '/complaints/:id',
  //   element: <ComplaintDetail />,
  // },
  {
    path: '/notices/:id',
    element: <NoticeDetail />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
