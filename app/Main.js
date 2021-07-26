import React, { useState } from "react";
import ReactDOM from "react-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./components/Home";
import HomeGuest from "./components/HomeGuest";
import About from "./components/About";
import Terms from "./components/Terms";
import CreatePost from "./components/CreatePost";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import axios from "axios";
import ViewSinglePost from "./components/ViewSinglePost";
import FlashMessages from "./components/FlashMessages";
axios.defaults.baseURL = "http://localhost:8080";
const Main = () => {
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("complexAppToken")));
  const [flashMessages, setFlashMessages] = useState([]);
  const addFlashMessage = (msg) => {
    setFlashMessages((prev) => prev.concat(msg));
  };
  return (
    <BrowserRouter>
      <FlashMessages messages={flashMessages} />
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      <Switch>
        <Route path="/" exact>
          {loggedIn ? <Home /> : <HomeGuest />}
        </Route>
        <Route path="/about" exact>
          <About />
        </Route>
        <Route path="/create-post" exact>
          <CreatePost addFlashMessage={addFlashMessage} />
        </Route>
        <Route path="/post/:id" exact>
          <ViewSinglePost />
        </Route>
        <Route path="/terms" exact>
          <Terms />
        </Route>
      </Switch>
      <Footer />
    </BrowserRouter>
  );
};
ReactDOM.render(<Main />, document.querySelector("#app"));
if (module.hot) {
  module.hot.accept;
}
