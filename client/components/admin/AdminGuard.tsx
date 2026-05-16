import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { verifyAdminSession } from "@/store/slices/adminSlice";
import { ADMIN_TOKEN_KEY } from "@/store/axiosAdmin";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status } = useAppSelector((s) => s.admin);

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }
    dispatch(verifyAdminSession());
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate("/admin/login", { replace: true });
    }
  }, [status, navigate]);

  if (status === "loading" || status === "idle") {
    return (
      <div className="min-h-screen bg-stone-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-navy border-t-sand rounded-full animate-spin" />
          <p className="font-montserrat text-sm text-stone-gray">
            Verificando sesión…
          </p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") return null;

  return <>{children}</>;
}
