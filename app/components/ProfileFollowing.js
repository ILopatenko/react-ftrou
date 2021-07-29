import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import Page from "./Page";

const ProfileFollowing = (props) => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const ourRequest = axios.CancelToken.source();
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/profile/${username}/following`, { cancelToken: ourRequest.token });
        setPosts(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
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
        {posts.map((follower, index) => {
          return (
            <Link to={`/profile/${follower.username}`} className="list-group-item list-group-item-action" key={index}>
              <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
            </Link>
          );
        })}
      </div>
    );
  }
};
export default ProfileFollowing;
