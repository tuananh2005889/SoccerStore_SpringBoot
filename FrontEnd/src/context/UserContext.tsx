import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Define types
export interface User {
  userName: string;
  fullName: string;
  gmail: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  avatar?: string;
  joinDate?: string;
  orders?: number;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  updateUserInfo: (userData: Partial<User>) => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('UserContext: Initializing...');
    // Base config for all requests
    axios.defaults.baseURL = 'http://localhost:8080';
    axios.defaults.withCredentials = true;
    const token = localStorage.getItem('token');
    console.log('UserContext: Token from localStorage:', token);
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      console.log('UserContext: Fetching user data...');
      const currentUserName = localStorage.getItem('username');
      console.log('UserContext: Current username:', currentUserName);
      
      if (!currentUserName) {
        console.log('UserContext: No username found in localStorage');
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`/api/user/name/${currentUserName}`);
      console.log('UserContext: User data received:', data);
      setUser(data);
    } catch (err) {
      console.error('UserContext: Error fetching user data:', err);
      toast.error('Lấy thông tin người dùng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const updateUserInfo = async (userData: Partial<User>) => {
    try {
      const currentUserName = localStorage.getItem('username');
      if (!currentUserName) {
        toast.error('Vui lòng đăng nhập lại');
        return;
      }

      const dto = {
        userName: currentUserName,
        ...userData
      };

      await axios.put('/api/user/update-info', dto);
      setUser(prev => prev ? { ...prev, ...userData } : null);
      toast.success('Cập nhật thành công');
    } catch (err) {
      console.error('UserContext: Error updating user info:', err);
      toast.error('Cập nhật thất bại');
      throw err;
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    try {
      const currentUserName = localStorage.getItem('userName');
      if (!currentUserName) throw new Error('User not logged in');

      await axios.post(
        '/api/user/update-avatar',
        null,
        { params: { userName: currentUserName, avatarUrl } }
      );
      
      setUser(prev => prev ? { ...prev, avatarUrl } : null);
      toast.success('Cập nhật avatar thành công');
    } catch (err) {
      console.error(err);
      toast.error('Cập nhật avatar thất bại');
      throw err;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const currentUserName = localStorage.getItem('username');
      if (!currentUserName) {
        toast.error('Vui lòng đăng nhập lại');
        return;
      }

      if (!user) {
        toast.error('Không thể lấy thông tin người dùng');
        return;
      }

      const dto = {
        userName: currentUserName,
        fullName: user.fullName,
        gmail: user.gmail,
        password: newPassword,
        phone: user.phone,
        address: user.address
      };

      await axios.put('/api/user/update-info', dto);
      toast.success('Đổi mật khẩu thành công');
    } catch (err) {
      console.error('UserContext: Error updating password:', err);
      toast.error('Đổi mật khẩu thất bại');
      throw err;
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      loading,
      updateUserInfo,
      updateAvatar,
      updatePassword
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 