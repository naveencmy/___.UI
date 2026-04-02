import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-lg text-muted-foreground mb-4">Page not found</p>
          <p className="text-sm text-muted-foreground">
            Continue prompting to build this page or return to Dashboard.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
