/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";
import { usePage } from "@inertiajs/react";
import { useEffect, type ReactNode } from "react";

export const DefaultLayout = ({ children }: { children: ReactNode }) => {
  const { messages } = usePage().props as Record<string, any> ;
  useEffect(() => {
    messages.map((msg : any) => {
      switch (msg.level_tag) {
        case "success":
          toast.success(msg.message);
          break;
        case "error":
          toast.error(msg.message);
          break;
        case "warning":
          toast.warning(msg.message);
          break;
        case "info":
          toast.info(msg.message);
          break;
        default:
          toast(msg.message);
      }
    });
  });

  return (
    <>
      <div>{children}</div>
    </>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export default (page: ReactNode) => <DefaultLayout>{page}</DefaultLayout>;
