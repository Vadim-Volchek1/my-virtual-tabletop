import { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Не удалось загрузить профиль');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
  
      if (!res.ok) throw new Error('Ошибка обновления профиля');
  
      const data = await res.json();
  
      // обновляем состояние и localStorage, чтобы Header сразу знал про изменения
      setProfile(data.user);
      localStorage.setItem('profile', JSON.stringify(data.user));
  
      return data.user;
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message);
      throw err;
    }
  };
  

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, loading, error, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
