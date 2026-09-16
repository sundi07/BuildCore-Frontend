import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { InlineLoader } from "@/components/common/states";
import { useAuth } from "@/hooks/useAuth";
import { resolvePage } from "@/pages/registry";

export function WorkspaceRoute() {
  const params = useParams();
  const splat = params["*"] || "dashboard";
  const { session, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !session) {
      navigate("/", { replace: true });
    }
  }, [ready, session, navigate]);

  if (!ready || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <InlineLoader label="Opening workspace" />
      </div>
    );
  }

  return <AppLayout>{resolvePage(splat)}</AppLayout>;
}
