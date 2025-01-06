import React, { useEffect, useState } from 'react';
import './App.css';
import List from './components/list/List';
import Chat from './components/chat/Chat';
import Detail from './components/detail/Detail';
import Login from './components/login/Login';
import Notification from './components/notification/Notification';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './components/lib/firebase';
import { useUserStore } from './components/lib/userStore';
import { useChatStore } from './components/lib/useChatStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBackward } from '@fortawesome/free-solid-svg-icons';

function App() {
  const { currentUser, isloading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [theme, setTheme] = useState('#ffffff');
  const [showDetail, setShowDetail] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1020);

  useEffect(() => {
    // Listen for screen resize to update `isSmallScreen`
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1020);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, async (user) => {
      if (user?.uid) {
        console.log('User signed in:', user.uid);
        await fetchUserInfo(user.uid);
      } else {
        console.log('No user signed in.');
        fetchUserInfo(null);
      }
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  useEffect(() => {
    const container = document.querySelector('.container');
    if (container) {
      container.style.backgroundColor = theme; // Dynamically update container background
    }
  }, [theme]);

  if (isloading) {
    return <div>Loading...</div>;
  }

  const toggleDetail = () => setShowDetail(!showDetail);

  return (
    <div className={`container theme-${theme} ${isSmallScreen ? 'small-screen' : 'large-screen'}` }>
      {currentUser ? (
        <>
          <List />
          {chatId && (
            <>
              {!isSmallScreen && (
                // On large screens, show both Chat and Detail
                <>
                  <Chat />
                  <Detail setTheme={setTheme}  />
                </>
              )}
              {isSmallScreen && (
                <>
                  {!showDetail && <Chat />}
                  <div className="navigation">
                    <button onClick={toggleDetail} className="nav-button">
                      <FontAwesomeIcon icon={showDetail ? faBackward : faBars} />
                    </button>
                  </div>
                  {showDetail && <Detail setTheme={setTheme}/>}
                </>
              )}
            </>
          )}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
}

export default App;
