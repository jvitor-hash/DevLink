import { ULIB } from "@/shared/ui";
import { useState } from "react";

export default function Settings() {
  const [pageType, setPageType] = useState<string>();

  return (
    <>
      <div className="flex gap-2">
        {/* Sidebar */}
        <div className="flex flex-col gap-2">
          <ULIB.button>Conta</ULIB.button>
          <ULIB.button>Preferencias</ULIB.button>
          <ULIB.button>Notificacoes</ULIB.button>
        </div>
        {/* Content */}
        <div className="flex flex-col gap-2">
          {pageType === "profile" && (
            <></>
          )}

          {pageType === "preferences" && (
            <></>
          )}

          {pageType === "notification" && (
            <></>
          )}
        </div>
      </div>
    </>
  );
}