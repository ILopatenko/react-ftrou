import axios from "axios";
import React, { useState, useEffect } from "react";
import Page from "./Page";
import { useParams, Link } from "react-router-dom";
import LoadindDotsIcon from "./LoadindDotsIcon";
import ReactMarkdown from "react-markdown";
const ViewSinglePost = (props) => {
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
  }, []);
  if (isLoading) {
    return (
      <Page title="Loading ...">
        <LoadindDotsIcon />
      </Page>
    );
  } else {
    const date = new Date(post.createdDate);
    const dateFormated = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    return (
      <Page title={post.title}>
        <div className="d-flex justify-content-between">
          <h2>{post.title}</h2>
          <span className="pt-2">
            <a href="#" className="text-primary mr-2" title="Edit">
              <i className="fas fa-edit"></i>
            </a>
            <a className="delete-post-button text-danger" title="Delete">
              <i className="fas fa-trash"></i>
            </a>
          </span>
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
export default ViewSinglePost;
