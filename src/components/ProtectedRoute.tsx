import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBuilding } from '@/hooks/useBuilding';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { building, isLoading: isBuildingLoading, error: buildingError, fetchBuildingDetails } = useBuilding();
  const location = useLocation();
  
  // Check if Redux Persist is still rehydrating
  const isRehydrating = useSelector((state: RootState) => state._persist?.rehydrated === false);

  // Fetch building data if user is authenticated but building data is not loaded
  useEffect(() => {
    if (isAuthenticated && !building && !isBuildingLoading && !buildingError && !isRehydrating) {
      fetchBuildingDetails();
    }
  }, [isAuthenticated, building, isBuildingLoading, buildingError, isRehydrating, fetchBuildingDetails]);

  // Show loading while checking authentication, during rehydration, or while loading building data
  if (isLoading || isRehydrating || (isAuthenticated && isBuildingLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isBuildingLoading ? 'Loading building data...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;