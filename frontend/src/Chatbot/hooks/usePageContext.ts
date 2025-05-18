import { useEffect, useState } from 'react';

/**
 * Hook to track and provide the current page context for RAG queries
 * This hook returns the current page route and context to prioritize
 * relevant information in database queries.
 */
export const usePageContext = () => {
  const [pageContext, setPageContext] = useState<string>('');
  const [pageRoute, setPageRoute] = useState<string>(window.location.pathname);

  useEffect(() => {
    // Function to extract context from the current URL
    const updatePageContext = () => {
      const pathname = window.location.pathname;
      setPageRoute(pathname);
      
      // Extract context from pathname
      if (pathname.includes('projects')) {
        setPageContext('project');
      } else if (pathname.includes('tasks')) {
        setPageContext('softwareTask');
      } else if (pathname.includes('finance') || pathname.includes('financial')) {
        setPageContext('financialTransaction');
      } else if (pathname.includes('bills')) {
        setPageContext('bill');
      } else if (pathname.includes('budget')) {
        setPageContext('budget');
      } else if (pathname.includes('health') || pathname.includes('fitness')) {
        setPageContext('healthActivity');
      } else if (pathname.includes('workout')) {
        setPageContext('workoutPlan');
      } else if (pathname.includes('investment') || pathname.includes('investing')) {
        if (pathname.includes('asset')) {
          setPageContext('investmentAsset');
        } else if (pathname.includes('portfolio')) {
          setPageContext('investmentPortfolio');
        } else {
          setPageContext('investment');
        }
      } else {
        // Default context (empty means no specific context)
        setPageContext('');
      }
    };

    // Initial context update
    updatePageContext();

    // Set up listener for route changes
    const handleRouteChange = () => {
      updatePageContext();
    };

    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleRouteChange);
    
    // Custom event for detecting client-side navigation
    // This would need to be dispatched by your router on route changes
    window.addEventListener('routechange', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('routechange', handleRouteChange);
    };
  }, []);

  return { pageContext, pageRoute };
};

export default usePageContext; 