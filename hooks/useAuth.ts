import { useAuth as useAuthContext } from '../context/AuthContext';

// Re-export the hook for convenience
export const useAuth = useAuthContext;

// Default export for importing without named import
export default useAuthContext;