import { useAuth } from "../hook/useAuth";
import { Navigate } from "react-router";

const Protected = ({ children, role = 'buyer' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if(user.role !== role){
    return <Navigate to="/" />;
  }

  return children;
};

export default Protected;
