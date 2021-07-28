import axios from "axios";
import React, { useState, useEffect, useContext } from "react";
import Page from "./Page";
import { useParams, Link, withRouter } from "react-router-dom";
import LoadindDotsIcon from "./LoadindDotsIcon";
import ReactMarkdown from "react-markdown";
import ReactTooltip from "react-tooltip";
import NotFound from "./NotFound";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

const ViewSinglePost = (props) => {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState(null);
  useEffect(() => {
    const ourRequest = axios.CancelToken.source();
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/post/${id}`, { cancelToken: ourRequest.token });
        setPost(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error({ message: "Request to a server (fetch a post by ID) was cancelled by user!" });
      }
    };
    fetchPost();
    return () => {
      ourRequest.cancel();
    };
  }, [id]);
  if (!isLoading && !post) {
    return <NotFound />;
  }
  if (isLoading) {
    return (
      <Page title="Loading ...">
        <LoadindDotsIcon />
      </Page>
    );
  } else {
    const date = new Date(post.createdDate);
    const dateFormated = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const isOwner = () => {
      if (appState.loggedIn) {
        return appState.user.username === post.author.username;
      } else {
        return false;
      }
    };
    const deleteHandler = async () => {
      const areYouSure = window.confirm("Do you want to delete this post?");
      if (areYouSure) {
        try {
          const response = await axios.delete(`/post/${id}`, { data: { token: appState.user.token } });
          if (response.data === "Success") {
            appDispatch({ type: "flashMessage", value: "Post was deleted" });
            props.history.push(`/profile/${appState.user.username}`);
          }
        } catch (error) {
          console.error(error);
        }
      }
    };
    return (
      <Page title={post.title}>
        <div className="d-flex justify-content-between">
          <h2>{post.title}</h2>
          {isOwner() && (
            <span className="pt-2">
              <Link to={`/post/${post._id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2">
                <i className="fas fa-edit"></i>
              </Link>
              <ReactTooltip id="edit" className="custom-tooltip" />
              <a onClick={deleteHandler} data-tip="Delete" data-for="delete" className="delete-post-button text-danger">
                <i className="fas fa-trash"></i>
              </a>
              <ReactTooltip id="delete" className="custom-tooltip" />
            </span>
          )}
        </div>
        <p className="text-muted small mb-4">
          <Link to={`/profile/${post.author.username}`}>
            <img className="avatar-tiny" src={post.author.avatar} />
          </Link>
          Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormated}
        </p>
        <div className="body-content">
          <ReactMarkdown children={post.body} />
        </div>
      </Page>
    );
  }
};
export default withRouter(ViewSinglePost);
