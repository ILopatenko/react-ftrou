import React, { useContext } from "react";
import { Link } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";

const HeaderLoggedIn = (props) => {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);
  const handleLoguot = () => {
    appDispatch({ type: "logout" });
  };
  const handleSearchIcon = (e) => {
    e.preventDefault();
    appDispatch({ type: "openSearch" });
  };
  return (
    <div className="flex-row my-3 my-md-0">
      {/* SEARCH Icon */}
      <a data-for="search" data-tip="Search" onClick={handleSearchIcon} href="#" className="text-white mr-2 header-search-icon">
        <i className="fas fa-search"></i>
      </a>
      <ReactTooltip place="bottom" id="search" className="custom-tooltip"></ReactTooltip>
      {/* CHAT Icon */}{" "}
      <span data-for="chat" data-tip="Chat" className="mr-2 header-chat-icon text-white">
        <i className="fas fa-comment"></i>
        <span className="chat-count-badge text-white"> </span>
      </span>
      <ReactTooltip place="bottom" id="chat" className="custom-tooltip"></ReactTooltip>
      {/* AVATAR */}{" "}
      <Link to={`/profile/${appState.user.username}`} className="mr-2" data-for="profile" data-tip="View a profile">
        <img className="small-header-avatar" src={appState.user.avatar} />
      </Link>
      <ReactTooltip place="bottom" id="profile" className="custom-tooltip"></ReactTooltip>
      {/* CREATE POST */}{" "}
      <Link to="/create-post" className="btn btn-sm btn-success mr-2">
        Create Post
      </Link>
      {/* SIGH OUT button */}{" "}
      <button onClick={handleLoguot} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  );
};
export default HeaderLoggedIn;
