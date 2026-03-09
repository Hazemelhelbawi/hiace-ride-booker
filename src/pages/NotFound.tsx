import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logger.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-6xl font-bold text-primary">404</span>
        </div>
        <h1 className="mb-4 text-4xl font-bold text-foreground">Page Not Found</h1>
        <p className="mb-6 text-xl text-muted-foreground">Oops! The page you're looking for doesn't exist</p>
        <a 
          href="/" 
          className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
