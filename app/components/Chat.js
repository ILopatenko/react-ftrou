import React, { useContext, useEffect, useRef } from "react";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import { Link } from "react-router-dom";
//Socket.io
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");

const Chat = () => {
  //useImmer() for chat
  const [state, setState] = useImmer({
    fieldValue: "",
    chatMessages: [],
  });

  //useRef() forf autofocus
  const chatField = useRef(null);
  //useRef() forf autoscroll chat
  const chatLog = useRef(null);

  //APP LEVEL state abd dispatch
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  //useEffect() to show/hide a chat window
  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus();
      appDispatch({ type: "clearUnreadChatCount" });
    }
  }, [appState.isChatOpen]);

  //useEffect() to load all the messages from a server
  useEffect(() => {
    socket.on("chatFromServer", (message) => {
      setState((draft) => {
        draft.chatMessages.push(message);
      });
    });
  }, []);

  //useEffect() to auto scroll chat window and change icon Chat
  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
    if (state.chatMessages.length && !appState.isChatOpen) {
      appDispatch({ type: "incrementUnreadChatCount" });
    }
  }, [state.chatMessages]);

  const handleFieldChange = (e) => {
    const value = e.target.value;
    setState((draft) => {
      draft.fieldValue = value;
    });
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    //Send a message to a chat server
    socket.emit("chatFromBrowser", { message: state.fieldValue, token: appState.user.token });
    setState((draft) => {
      //Add a message to a state collection of messages
      draft.chatMessages.push({ message: draft.fieldValue, username: appState.user.username, avatar: appState.user.avatar });
      draft.fieldValue = "";
    });
  };
  //JSX
  return (
    <div id="chat-wrapper" className={"chat-wrapper shadow border-top border-left border-right " + (appState.isChatOpen ? "chat-wrapper--is-visible" : "")}>
      <div className="chat-title-bar bg-primary">
        Chat
        <span onClick={() => appDispatch({ type: "closeChat" })} className="chat-title-bar-close">
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMessages.map((message, index) => {
          if (message.username === appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            );
          } else {
            return (
              <div key={index} className="chat-other">
                <Link to={`/profile/${message.username}`}>
                  <img className="avatar-tiny" src={message.avatar} />
                </Link>
                <div className="chat-message">
                  <div className="chat-message-inner">
                    <Link to={`/profile/${message.username}`}>
                      <strong>{message.username + ": "} </strong>
                    </Link>
                    {message.message}
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
      <form onSubmit={handleOnSubmit} id="chatForm" className="chat-form border-top">
        <input value={state.fieldValue} onChange={handleFieldChange} ref={chatField} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoComplete="off" />
      </form>
    </div>
  );
};
export default Chat;
