import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('lumera_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('lumera_token') || null;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate token and sync profile on initial load
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await fetch('/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            const updatedUser = { ...data.data, token };
            setUser(updatedUser);
            localStorage.setItem('lumera_user', JSON.stringify(updatedUser));
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      const userData = data.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('lumera_token', userData.token);
      localStorage.setItem('lumera_user', JSON.stringify(userData));

      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  // Register handler
  const register = async (name, email, password, role = 'customer') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      const userData = data.data;
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('lumera_token', userData.token);
      localStorage.setItem('lumera_user', JSON.stringify(userData));

      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  // Update Profile handler
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      const updatedUserData = { ...user, ...data.data };
      if (data.data.token) {
        setToken(data.data.token);
        localStorage.setItem('lumera_token', data.data.token);
        updatedUserData.token = data.data.token;
      }
      setUser(updatedUserData);
      localStorage.setItem('lumera_user', JSON.stringify(updatedUserData));

      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await fetch('/api/users/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('lumera_token');
    localStorage.removeItem('lumera_user');
    localStorage.removeItem('lumera_cart');
    localStorage.removeItem('lumera_wishlist');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
