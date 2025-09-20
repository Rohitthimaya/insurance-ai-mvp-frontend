import './App.css'
import { useState } from 'react';
import Auth from './components/Auth';
import ComparePlans from './components/ComparePlans';
import Navbar from './components/Navbar';

function App() {
  const [loggedIn, setLoggedIn] = useState(true);

  // This function can be passed to Auth component to set login state
  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
  };

  return (
    <div>
      <Navbar loggedIn={loggedIn} onLogout={handleLogout} />
      {!loggedIn && <Auth onLogin={handleLogin} />}
      {loggedIn && <ComparePlans />}
    </div>
  );
}

export default App;
