import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import Page from "./Page";
import Post from "./Post";

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
  }, [username]);

  if (isLoading) {
    return (
      <Page title="Loading ...">
        <LoadingDotsIcon />
      </Page>
    );
  } else {
    return (
      <div className="list-group">
        {posts.map((post) => {
          return <Post noAuthor={true} key={post._id} post={post} />;
        })}
      </div>
    );
  }
};
export default ProfilePosts;
