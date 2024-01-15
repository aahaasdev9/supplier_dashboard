import React, { useEffect, useState } from 'react'
import 'firebase/analytics';
import { db, auth, firestore } from '../firebase';
import { addDoc, collection, doc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { faPaperPlane, faMagnifyingGlass, faGear, faUserPlus, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import logo from '../../src/logo.svg';
import { useAuthState } from 'react-firebase-hooks/auth';


function ChatBox() {

  const [customer_message_collections, set_customer_message_collections] = useState([
    {
      'customer_collection_id': '7XqULuARo2NWrO89DnV9IVGsZ2Q2',
      'supplier_id': 'XIidzTBzhaWAtUoRlTMUvvEnDlz1'
    },
    {
      'customer_collection_id': 'PiOis8bYltTFJ10IFA2dksQIMrt1',
      'supplier_id': ''
    }
  ]);

  // updating user messaged based on customer id
  const [messages, setMessages] = useState([]);
  // updating 
  const [userID, setUSerID] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [cusData, setData] = useState([]);


  const [user] = useAuthState(auth)
  console.log(user);

  const sendMessage = async (event) => {

    event.preventDefault();

    if (userMessage.trim() === "") {
      alert("Enter valid message");
      return;
    }

    const adminUID = 'XIidzTBzhaWAtUoRlTMUvvEnDlz1';
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







  // for send the message 

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

  // convert the nano seconds to time

  const getTime = (value1, value2) => {
    if (value1 !== undefined && value2 !== undefined) {
      const date = new Date(value1 * 1000 + value2 / 1e6);
      return date.toLocaleTimeString(); // Convert to a localized string
    }
    return ''; // Return an empty string if either value is undefined
  };

  useEffect(() => {
    const fetchData = async () => {
      try {


        const data_promise = customer_message_collections.map(async (value, key) => {
          console.log(value);
          if (value.supplier_id === 'XIidzTBzhaWAtUoRlTMUvvEnDlz1') {
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
          } else {
            return null;
          }
        })

        const allData = await Promise.all(data_promise);
        setData(allData);
        // console.log((allData));
        console.log(allData);




      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    getUserMessages('7XqULuARo2NWrO89DnV9IVGsZ2Q2')
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
            cusData.map((value, key) => (
              value &&
              <div className="customer_details"
                key={key}
                onClick={() => getUserMessages(value.customerId.customer_collection_id)}
              >
                <img className="user_image" src={value.sortedMessages[0].avatar} alt={value} />
                <p className='user_name'>{value.sortedMessages[0].name}</p>
                <p className='suppliername'>{value.customerId.supplier_id === undefined || value.customerId.supplier_id === null || value.customerId.supplier_id === '' ? "" : `  collab with ${value.customerId.supplier_id}`}</p>
                <p className='user_last_msg'>{value.sortedMessages[value.sortedMessages.length - 1].text}</p>
                <p className='last_time'>{getTime(value.sortedMessages[value.sortedMessages.length - 1].createdAt.nanoseconds, value.sortedMessages[value.sortedMessages.length - 1].createdAt.seconds)}</p>

              </div>
            )
            )
          }
        </div>

      </div>

      <div className="col-8 border customer_names">
        <div className="main_content">
          <div className="main_customer_head">
            <img className="user_image user_image_main" src={messages[0]?.avatar || logo} />
            <p className="user_name_main">{messages[0]?.name}</p>
            <p className="user_last_seen_main">last seen today moorning at 10.30</p>
            <FontAwesomeIcon icon={faGear} className="settings_icon" />
          </div>
          <div className="chat_msg chat_msg_update">
            {
              messages.map((value, key) => {
                return (
                  <div className={`${value.uid === user.uid ? "chat_bubble_main right_side" : "chat_bubble_main left_side"}`}>
                    <p className="">{value.text}</p>
                    <p>{value.adminUID}</p>
                    {/* <span className="chat_time">{getTime(value.createdAt.nanoseconds, value.createdAt.nanoseconds)}</span> */}
                  </div>
                )
              })
            }
            <span className="go_up_button">
              <FontAwesomeIcon icon={faAngleDown} />
            </span>
          </div>
          <div className="message_send_content d-flex">

            <input type="text" className="col-11" value={userMessage} placeholder={`chat with ${userID}`} onChange={(e) => setUserMessage(e.target.value)} />
            <button className="col-1 send_icon_main">
              <FontAwesomeIcon icon={faPaperPlane} className="" onClick={sendMessage} /></button>
          </div>
        </div>
      </div>


    </div>
  )
}

export default ChatBox