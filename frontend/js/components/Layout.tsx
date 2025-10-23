/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";
import { usePage } from "@inertiajs/react";
import { useEffect, type ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
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

export default (page: ReactNode) => <Layout>{page}</Layout>;
