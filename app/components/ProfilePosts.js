import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadindDotsIcon from "./LoadindDotsIcon";
import Page from "./Page";

const ProfilePosts = (props) => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const ourRequest = axios.CancelToken.source();
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/profile/${username}/posts`, { cancelToken: ourRequest.token });
        setPosts(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error({ message: "Request to a server (fetch all the posts) was cancelled by user!" });
      }
    };
    fetchPosts();
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
    return (
      <div className="list-group">
        {posts.map((post) => {
          const date = new Date(post.createdDate);
          const dateFormated = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
          return (
            <Link to={`/post/${post._id}`} className="list-group-item list-group-item-action" key={post._id}>
              <img className="avatar-tiny" src={post.author.avatar} /> <strong> {post.title} </strong>
              <span className="text-muted small">on {dateFormated} </span>
            </Link>
          );
        })}
      </div>
    );
  }
};
export default ProfilePosts;
