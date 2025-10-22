import { toast } from "sonner";
import { usePage } from "@inertiajs/react";
import { useEffect } from "react";

const Layout = ({ children }) => {
  const { messages } = usePage().props;
  useEffect(() => {
    messages.map((msg)=>{
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
    })
  })
  
  return (
    <>
      <div>{children}</div>
    </>
  );
};

export default (page) => <Layout>{page}</Layout>;
