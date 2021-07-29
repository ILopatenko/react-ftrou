import axios from "axios";
import React, { useEffect, useContext } from "react";
import Page from "./Page";
import { useParams, Link, withRouter } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import StateContext from "../StateContext";
import { useImmerReducer } from "use-immer";
import DispatchContext from "../DispatchContext";
import NotFound from "./NotFound";

const EditPost = (props) => {
  //appState and appDispatch to work with flash messages (APP level state)
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  //useImmerReduser to work with a multistate (component level state)
  const originalState = {
    title: { value: "", hasErrors: false, message: "" },
    body: { value: "", hasErrors: false, message: "" },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false,
  };
  const ourReduser = (draft, action) => {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        break;
      case "titleChange":
        draft.title.hasErrors = false;
        draft.title.value = action.value;
        break;
      case "bodyChange":
        draft.body.hasErrors = false;
        draft.body.value = action.value;
        break;
      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++;
        }
        break;
      case "saveRequestStarted":
        draft.isSaving = true;
        break;
      case "saveRequestFinishad":
        draft.isSaving = false;
        break;
      case "titleRules":
        if (!action.value.trim()) {
          (draft.title.hasErrors = true), (draft.title.message = "Plese enter a post title");
        }
        break;
      case "bodyRules":
        if (!action.value.trim()) {
          (draft.body.hasErrors = true), (draft.body.message = "Please write a post");
        }
        break;
      case "notFound":
        draft.notFound = true;
        break;
    }
  };
  const [state, dispatch] = useImmerReducer(ourReduser, originalState);

  //onSubmit form handler - will call dispatch with 'submitRequest' task (state.sendCount++) => call useEffect() => send and save new data to a server
  const submitHandler = (e) => {
    e.preventDefault();
    dispatch({ type: "titleRules", value: state.title.value });
    dispatch({ type: "bodyRules", value: state.body.value });
    dispatch({ type: "submitRequest" });
  };

  //Fetch post data from server by post id (only at 1st render of component)
  useEffect(() => {
    const ourRequest = axios.CancelToken.source();
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token });
        if (response.data) {
          dispatch({ type: "fetchComplete", value: response.data });
          if (appState.user.username != response.data.author.username) {
            appDispatch({ type: "flashMessage", value: "ACCESS DENIED!" });
            props.history.push("/");
          }
        } else {
          dispatch({ type: "notFound" });
        }
      } catch (error) {
        console.error({ message: "Request to a server (fetch a post by ID) was cancelled by user!" });
      }
    };
    fetchPost();
    return () => {
      ourRequest.cancel();
    };
  }, []);

  //Sending data (title, body and user token) to a server to change post (each time when state,sendCount will be changed)
  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "saveRequestStarted" });
      const ourRequest = axios.CancelToken.source();
      const fetchPost = async () => {
        try {
          const response = await axios.post(`/post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: ourRequest.token });
          dispatch({ type: "saveRequestFinishad" });
          appDispatch({ type: "flashMessage", value: "Post was updated" });
        } catch (error) {
          console.error({ message: "Request to a server (fetch a post by ID) was cancelled by user!" });
        }
      };
      fetchPost();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.sendCount]);

  if (state.notFound) {
    return <NotFound />;
  }
  if (state.isFetching) {
    return (
      <Page title="Loading ...">
        <LoadingDotsIcon />
      </Page>
    );
  } else {
    return (
      <Page title="Edit post">
        <Link className="small font-weight-bold" to={`/post/${state.id}`}>
          &laquo; Back to post
        </Link>
        <form className="mt-3" onSubmit={submitHandler}>
          <div className="form-group">
            <label htmlFor="post-title" className="text-muted mb-1">
              <small>Title</small>
            </label>
            {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>}
            <input onBlur={(e) => dispatch({ type: "titleRules", value: e.target.value })} onChange={(e) => dispatch({ type: "titleChange", value: e.target.value })} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
          </div>
          <div className="form-group">
            <label htmlFor="post-body" className="text-muted mb-1 d-block">
              <small>Body Content</small>
            </label>
            {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>}
            <textarea onBlur={(e) => dispatch({ type: "bodyRules", value: e.target.value })} onChange={(e) => dispatch({ type: "bodyChange", value: e.target.value })} value={state.body.value} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" />
          </div>
          <button disabled={state.isSaving} className="btn btn-primary">
            Save Updates
          </button>
        </form>
      </Page>
    );
  }
};
export default withRouter(EditPost);
