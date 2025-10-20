import { LoginForm } from "@/components/login-form";
import { Building2 } from "lucide-react";
import { Link } from "@inertiajs/react";
import Ballpit from "@/components/Ballpit";

export default function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Building2 className="size-6 text-primary" />
            Immob.
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Ballpit
          count={200}
          gravity={0.4}
          friction={0.9975}
          wallBounce={0.95}
          followCursor={true}
          colors={[14186819, 10186819, 1805]}
        />
      </div>
    </div>
  );
}
