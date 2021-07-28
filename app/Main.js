//Main components
import React, { useEffect } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
//Components
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./components/Home";
import HomeGuest from "./components/HomeGuest";
import About from "./components/About";
import Terms from "./components/Terms";
import CreatePost from "./components/CreatePost";
import ViewSinglePost from "./components/ViewSinglePost";
import FlashMessages from "./components/FlashMessages";
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
import Search from "./components/Search";
//axios
import axios from "axios";
axios.defaults.baseURL = "http://localhost:8080";
//Immer
import { useImmerReducer } from "use-immer";

const Main = () => {
  //Create an initial state to use with useReducer() hook
  const initialStateForReducer = {
    loggedIn: Boolean(localStorage.getItem("complexAppToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("complexAppToken"),
      username: localStorage.getItem("complexAppUsername"),
      avatar: localStorage.getItem("complexAppAvatar"),
    },
    isSearchOpen: false,
  };
  //Create a function for useReducer() hook
  const myReducer = (draft, action) => {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.user = action.data;
        break;
      case "logout":
        draft.loggedIn = false;
        break;
      case "flashMessage":
        draft.flashMessages.push(action.value);
        break;
      case "openSearch":
        draft.isSearchOpen = true;
        break;
      case "closeSearch":
        draft.isSearchOpen = false;
        break;
    }
  };
  const [state, dispatch] = useImmerReducer(myReducer, initialStateForReducer);
  useEffect(() => {
    if (state.loggedIn === true) {
      localStorage.setItem("complexAppToken", state.user.token);
      localStorage.setItem("complexAppUsername", state.user.username);
      localStorage.setItem("complexAppAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("complexAppToken", state.user.token);
      localStorage.removeItem("complexAppUsername", state.user.username);
      localStorage.removeItem("complexAppAvatar", state.user.avatar);
    }
  }, [state.loggedIn]);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Switch>
            <Route path="/profile/:username" exact>
              <Profile />
            </Route>

            <Route path="/" exact>
              {state.loggedIn ? <Home /> : <HomeGuest />}
            </Route>

            <Route path="/about" exact>
              <About />
            </Route>

            <Route path="/create-post" exact>
              <CreatePost />
            </Route>

            <Route path="/post/:id" exact>
              <ViewSinglePost />
            </Route>

            <Route path="/post/:id/edit" exact>
              <EditPost />
            </Route>

            <Route path="/terms" exact>
              <Terms />
            </Route>

            <Route>
              <NotFound />
            </Route>
          </Switch>
          <CSSTransition timeout={300} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <Search />
          </CSSTransition>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};
ReactDOM.render(<Main />, document.querySelector("#app"));
if (module.hot) {
  module.hot.accept;
}
