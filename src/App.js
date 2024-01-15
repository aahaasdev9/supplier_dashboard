import './App.css';
import { faPaperPlane, faMagnifyingGlass, faGear, faUserPlus, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Modal } from 'react-bootstrap';

// static logo
import logo from '../src/logo.svg';

import 'firebase/analytics';
import { auth, firestore } from './firebase';
import { useAuthState } from "react-firebase-hooks/auth";
import { usercollecionData } from 'react-firebase-hooks/firestore'
import { db } from "./firebase";
import { addDoc, collection, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import NavBar from './Components/Navbar';
import Welcome from './Components/Welcome';
import ChatBox from './Components/ChatBox';

function App() {





  const [user] = useAuthState(auth);







  return (

    <div className="App">
      <NavBar />
      {!user ? (
        <Welcome />
      ) : (
        <>
          <ChatBox />
        </>
      )}
    </div>
  );
}

export default App;
