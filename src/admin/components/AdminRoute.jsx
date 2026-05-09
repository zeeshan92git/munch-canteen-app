import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-[#e85a2a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user.role == 'admin')    return <Navigate to="/admin/login" replace />;
  
  return children;
}