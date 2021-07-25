import React from "react"
import ReactDOM from "react-dom"
import Footer from "./components/Footer"
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import About from "./components/About"
import Terms from "./components/Terms"
import { BrowserRouter, Switch, Route } from "react-router-dom"

const Main = () => (
  <BrowserRouter>
    <Header />
    <Switch>
      <Route path="/" exact>
        <HomeGuest />
      </Route>
      <Route path="/about" exact>
        <About />
      </Route>
      <Route path="/terms" exact>
        <Terms />
      </Route>
    </Switch>
    <Footer />
  </BrowserRouter>
)
ReactDOM.render(<Main />, document.querySelector("#app"))
if (module.hot) {
  module.hot.accept
}
