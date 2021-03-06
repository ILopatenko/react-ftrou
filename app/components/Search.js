import React, { useEffect, useContext } from "react";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import axios from "axios";
import Post from "./Post";
const Search = (props) => {
  const appDispatch = useContext(DispatchContext);

  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0,
  });

  //Create an event listener for ESC key
  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler);
    return () => document.removeEventListener("keyup", searchKeyPressHandler);
  }, []);
  const searchKeyPressHandler = (e) => {
    if (e.keyCode == 27) {
      appDispatch({ type: "closeSearch" });
    }
  };

  //useEffect to decrease requests to a server - request will be sended only after some time after user ended type a text of search request
  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState((draft) => {
        draft.show = "loading";
      });
      const delay = setTimeout(() => {
        setState((draft) => {
          draft.requestCount++;
        });
      }, 1000);
      return () => {
        clearTimeout(delay);
      };
    } else {
      setState((draft) => {
        draft.show = "neither";
      });
    }
  }, [state.searchTerm]);

  //useEffect to send a request - will check state.requestCount
  useEffect(async () => {
    if (state.requestCount) {
      const ourRequest = axios.CancelToken.source();
      const fetchResults = async () => {
        try {
          const response = await axios.post("/search", { searchTerm: state.searchTerm }, { cancelToken: ourRequest.token });
          setState((draft) => {
            draft.results = response.data;
            draft.show = "results";
          });
        } catch (error) {
          console.error(error);
        }
      };
      fetchResults();
      return () => ourRequest.cancel;
    }
  }, [state.requestCount]);

  //handler input
  const handleInput = (e) => {
    const value = e.target.value;
    setState((draft) => {
      draft.searchTerm = value;
    });
  };
  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={() => appDispatch({ type: "closeSearch" })} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>
      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={"circle-loader " + (state.show === "loading" ? "circle-loader--visible" : "")}></div>
          <div className={"live-search-results " + (state.show === "results" ? "live-search-results--visible" : "")}>
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length} {state.results.length > 1 ? "items were" : "item was"} found)
                </div>
                {state.results.map((post) => {
                  return <Post key={post._id} post={post} onClick={() => appDispatch({ type: "closeSearch" })} />;
                })}
              </div>
            )}
            {!Boolean(state.results.length) && <p className="alert alert-danger text-center shadow-sm">Sorry, no any results were found!</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Search;
