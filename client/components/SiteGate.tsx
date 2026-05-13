import { useEffect } from "react";
import UnderConstruction from "@/pages/UnderConstruction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSiteConfig,
  verifyBypassToken,
  bypassGranted,
  setLocked,
  BYPASS_KEY,
} from "@/store/slices/siteConfigSlice";
import logger from "@/lib/logger";

export type { SiteConfig } from "@/store/slices/siteConfigSlice";

export default function SiteGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { status, config } = useAppSelector((s) => s.siteConfig);

  useEffect(() => {
    async function check() {
      logger.log("[SiteGate] fetching site-config...");
      const result = await dispatch(fetchSiteConfig());

      if (fetchSiteConfig.rejected.match(result)) {
        logger.warn("[SiteGate] fetch failed — showing site (fallback)");
        return;
      }

      const cfg = result.payload;
      logger.log(
        "[SiteGate] under_construction =",
        cfg.under_construction,
        typeof cfg.under_construction,
      );

      if (!cfg.under_construction) {
        logger.log("[SiteGate] not locked — showing site");
        return;
      }

      const stored = localStorage.getItem(BYPASS_KEY);
      logger.log(
        "[SiteGate] bypass token in localStorage:",
        stored ? "FOUND" : "none",
      );

      if (stored) {
        const verifyResult = await dispatch(verifyBypassToken(stored));
        const valid =
          verifyBypassToken.fulfilled.match(verifyResult) &&
          verifyResult.payload;
        logger.log("[SiteGate] bypass token valid:", valid);
        // verifyBypassToken reducers handle status transition
        return;
      }

      // No token — lock the site
      logger.log("[SiteGate] showing under-construction page");
      dispatch(setLocked());
    }

    check();
  }, [dispatch]);

  const handleBypass = (token: string) => {
    dispatch(bypassGranted(token));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#2E3447] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#ff9933] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "locked") {
    return <UnderConstruction config={config} onBypass={handleBypass} />;
  }

  return <>{children}</>;
}
