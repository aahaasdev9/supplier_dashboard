import './App.css';
import 'firebase/analytics';
import { auth } from './firebase';
import { useAuthState } from "react-firebase-hooks/auth";
import Welcome from './Components/Welcome';
import ChatBox from './Components/ChatBox';
import axios from 'axios';

// axios.defaults.baseURL = "http://192.168.1.19:8000/api";
axios.defaults.baseURL = "http://192.168.1.2:8000/api";

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
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