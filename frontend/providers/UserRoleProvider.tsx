import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserRoleContextValue {
  userRole: 'user' | 'expert' | null;
  isLoading: boolean;
  setUserRole: (role: 'user' | 'expert') => void;
}

const UserRoleContext = createContext<UserRoleContextValue | undefined>(undefined);

interface UserRoleProviderProps {
  children: ReactNode;
}

export function UserRoleProvider({ children }: UserRoleProviderProps) {
  // const { user, isPending } = useAuth(); // Removed useAuth hook call
  const [userRole, setUserRole] = useState<'user' | 'expert' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      // if (!user) { // Condition removed as 'user' is no longer available from useAuth
      //   setUserRole(null);
      //   setIsLoading(false);
      //   return;
      // }

      try {
        const response = await fetch('/api/users/role');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
        } else {
          // User doesn't exist in our system yet, default to 'user'
          setUserRole('user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user');
      } finally {
        setIsLoading(false);
      }
    };

    // if (!isPending) { // Condition removed as 'isPending' is no longer available from useAuth
      fetchUserRole();
    // }
  }, []); // Dependencies changed from [user, isPending] to []

  const handleSetUserRole = async (role: 'user' | 'expert') => {
    try {
      const response = await fetch('/api/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        setUserRole(role);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  return (
    <UserRoleContext.Provider value={{ userRole, isLoading: isLoading, setUserRole: handleSetUserRole }}> {/* isPending removed from isLoading */}
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
}
