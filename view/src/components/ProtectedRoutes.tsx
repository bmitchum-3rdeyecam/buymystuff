import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRoutesProps {
  token: string | undefined;
}

export default function ProtectedRoutes({token}: ProtectedRoutesProps) {
  return token ? <Outlet /> : <Navigate to="/login" />;
};
