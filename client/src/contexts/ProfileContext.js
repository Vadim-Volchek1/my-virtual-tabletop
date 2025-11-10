import React, { createContext, useContext, useEffect, useState } from 'react';
import { profileAPI } from '../services/profileAPI';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Загрузка профиля
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileAPI.getProfile();
      setProfile(data.user || data);
      localStorage.setItem('profile', JSON.stringify(data.user || data));
    } catch (err) {
      console.error('❌ Fetch profile error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Обновление профиля
  const updateProfile = async (updates) => {
    try {
      const data = await profileAPI.updateProfile(updates);
      setProfile(data.user || data);
      localStorage.setItem('profile', JSON.stringify(data.user || data));
      return data;
    } catch (err) {
      console.error('❌ Update profile error:', err);
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, loading, error, fetchProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
