import { useState } from 'react';
import { User } from '@/types/overtime';
import LoginForm from '@/components/overtime/LoginForm';
import MainApp from '@/components/overtime/MainApp';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <MainApp
      currentUser={currentUser}
      onLogout={handleLogout}
    />
  );
};

export default Index;
