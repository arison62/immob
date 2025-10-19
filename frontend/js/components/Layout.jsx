import { Link } from "@inertiajs/react";

const Layout = ({ children }) => (
  <>
    <div className="flex items-center justify-center mt-32">{children}</div>
  </>
);

export default (page) => <Layout>{page}</Layout>;
