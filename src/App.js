import './App.css';
import 'firebase/analytics';
import { auth } from './firebase';
import { useAuthState } from "react-firebase-hooks/auth";
import Welcome from './Components/Welcome';
import ChatBox from './Components/ChatBox';

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