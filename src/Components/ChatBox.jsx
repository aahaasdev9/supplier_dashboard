import React, { useEffect, useLayoutEffect, useState } from 'react'
import 'firebase/analytics';
import { db, auth } from '../firebase';
import { addDoc, collection, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { faPaperPlane, faMagnifyingGlass, faGear, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAuthState } from 'react-firebase-hooks/auth';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import axios, { all } from 'axios';

function ChatBox() {

  const [customer_message_collections, set_customer_message_collections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userID, setUSerID] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [cusData, setData] = useState([]);
  const [user] = useAuthState(auth)

  const sendMessage = async (event) => {
    const adminUID = user.uid;
    event.preventDefault();
    if (userMessage.trim() === "") {
      alert("Enter valid message");
      return;
    }
    const { displayName, photoURL } = auth.currentUser;
    await addDoc(collection(db, "chats/chats_dats/" + userID), {
      text: userMessage,
      name: displayName,
      avatar: photoURL,
      createdAt: serverTimestamp(),
      adminUID,
    });
    setUserMessage("");
  }

  const getUserMessages = (value) => {
    const q = query(
      collection(db, "chats/chats_dats/" + value),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const getMessages = onSnapshot(q, (QuerySnapshot) => {
      const fetchedMessages = [];
      QuerySnapshot.forEach((doc) => {
        fetchedMessages.push({ ...doc.data(), id: doc.id });
      });
      const sortedMessages = fetchedMessages.sort(
        (a, b) => a.createdAt - b.createdAt
      );
      setMessages(sortedMessages);
      setUSerID(value)
    });
    return getMessages;
  }

  const getTime = (value, type) => {
    if (value?.seconds !== undefined && value?.nanoseconds !== undefined) {
      const ts = (value.seconds + value.nanoseconds / 1000000000) * 1000;
      if (type === "value1") {
        return new Date(ts).toLocaleDateString();
      }
      if (type === "value2") {
        return new Date(ts).toDateString();
      }
      return null
    }
    return '';
  };

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  const signOut = () => {
    auth.signOut();
  };

  const fetchData = async (paraData) => {
    try {
      const data_promise = paraData.map(async (value, key) => {
        // if (value.supplier_id === 'XIidzTBzhaWAtUoRlTMUvvEnDlz1') {
        const q = query(
          collection(db, "chats/chats_dats/" + value.customer_collection_id),
          orderBy("createdAt", "desc"),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        const fetchedMessages = [];
        querySnapshot.forEach((doc) => {
          fetchedMessages.push({ ...doc.data(), id: doc.id });
        });
        const sortedMessages = fetchedMessages.sort(
          (a, b) => a.createdAt - b.createdAt
        );
        return { customerId: value, sortedMessages };
        // } else {
        // return null
        // }
      })
      setData([''])
      const allData = await Promise.all(data_promise);
      setData(allData);
      console.log('data updateed...');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }



  useEffect(() => {
    // const getChatdata = async () => {
    try {
      axios.get(`/chats/${user.uid}`).then(res => {
        set_customer_message_collections(res.data.data)
        fetchData(res.data.data)
      })
    } catch (error) {
      console.log(error);
    }
    // }
  }, [])

  return (
    <div className="d-flex">
      <div className="col-4">
        <div className="col-11 search_box d-flex align-items-center justify-content-start ">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="col-1 search_icon" />
          <input className="col-9 my-2 " placeholder="Search user..." />
        </div>
        <div className="customer_head">
          {
            console.log(cusData)
          }
          {
            cusData.map((value, key) => (
              value?.sortedMessages?.length >= 1 &&
              <div className="customer_details" key={key} onClick={() => getUserMessages(value.customerId.customer_collection_id)}              >
                <img className="user_image" src={value?.sortedMessages[0].avatar} alt={value} />
                <p className='user_name'>{value?.sortedMessages[0].name}</p>
                <p className='user_last_msg'>{value?.sortedMessages[value.sortedMessages.length - 1].text}</p>
                <p className='last_time'>{getTime(value?.sortedMessages[value?.sortedMessages?.length - 1].createdAt, "value1")}</p>
              </div>
            ))
          }
        </div>
      </div>
      <div className="col-8 border customer_names">
        {
          messages.length >= 1 &&

          <div className="main_content">
            <div className="main_customer_head">
              <img className="user_image user_image_main" src={messages[0]?.avatar} />
              <p className="user_name_main">{messages[0]?.name}</p>
              <p className="user_last_seen_main">last seen at {getTime(messages[messages.length - 1]?.createdAt, "value2")}</p>
              {user ? (
                <button onClick={signOut} className="sign_out_button" type="button">
                  Sign Out
                </button>
              ) : (
                <button className="sign_in_button">
                  <img
                    onClick={googleSignIn}
                    src={googleSignIn}
                    alt="sign in with google"
                    type="button"
                  />
                </button>
              )}
              <FontAwesomeIcon icon={faGear} className="settings_icon" />
            </div>
            <div className="chat_msg chat_msg_update">
              {
                messages.map((value, key) => {
                  return (
                    <div className={`${value.adminUID === user.uid ? "chat_bubble_main right_side" : "chat_bubble_main left_side"} `} key={key}>
                      <p className="chat_context">{value.text} : <span>({value.name || value.uid})</span> </p>
                      <span className="chat_time">{getTime(value?.createdAt, "value2")}</span>
                    </div>
                  )
                })
              }
              <span className="go_down_button">
                <FontAwesomeIcon icon={faAngleDown} />
              </span>
            </div>
            <div className="message_send_content d-flex">
              <input type="text" className="col-11" value={userMessage} placeholder={`chat with user...`} onChange={(e) => setUserMessage(e.target.value)} />
              <button className="col-1 send_icon_main">
                <FontAwesomeIcon icon={faPaperPlane} className="" onClick={sendMessage} /></button>
            </div>
          </div>
        }
      </div>
    </div>
  )
}

export default ChatBox