import { Outlet, useNavigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { useEffect, useState } from 'react';
import { getCookieToken } from './store/Cookie';
import { useDispatch } from 'react-redux';
import { DELETE_USERINFO } from './store/loginRedux';
import { persistor } from '.';

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!getCookieToken()) {
      dispatch(DELETE_USERINFO());
      persistor.purge();
      localStorage.removeItem('menu');
      navigate('/login');
    } else {
      if (
        !JSON.parse(JSON.parse(localStorage.getItem('persist:root')).userInfo)
          .nickname
      ) {
        navigate('/login');
      }
    }
  }, [getCookieToken()]);

  if (window.location.pathname === '/') {
    localStorage.setItem('menu', '');
  }

  const handleMenu = (value) => {
    localStorage.setItem('menu', value);
  };

  return (
    <div className='container'>
      <Header menu={localStorage.getItem('menu')} onMenu={handleMenu} />
      <div className='main'>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default App;
