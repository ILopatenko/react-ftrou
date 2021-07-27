import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Page from "./Page";
import StateContext from "../StateContext";
import axios from "axios";
import ProfilePosts from "./ProfilePosts";

const Profile = () => {
  const [profileData, setProfileData] = useState({
    profileUsername: "...",
    profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
    isFollowing: false,
    counts: {
      followerCount: "",
      followingCount: "",
      postCount: "",
    },
  });
  const { username } = useParams();
  const appState = useContext(StateContext);
  useEffect(() => {
    const ourRequest = axios.CancelToken.source();
    const fetchData = async () => {
      try {
        const response = await axios.post(`/profile/${username}`, { token: appState.user.token }, { cancelToken: ourRequest.token });
        setProfileData(response.data);
      } catch (error) {
        console.error({ message: "Request to a server (fetch user profile) was cancelled by user!" });
      }
    };
    fetchData();
    return () => {
      ourRequest.cancel();
    };
  }, []);
  return (
    <Page title="Profile details">
      <h2>
        <img className="avatar-small" src={profileData.profileAvatar} /> {profileData.profileUsername}
        <button className="btn btn-primary btn-sm ml-2">
          Follow <i className="fas fa-user-plus"></i>{" "}
        </button>
      </h2>
      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <a href="#" className="active nav-item nav-link">
          Posts: {profileData.counts.postCount}{" "}
        </a>
        <a href="#" className="nav-item nav-link">
          Followers: {profileData.counts.followerCount}{" "}
        </a>
        <a href="#" className="nav-item nav-link">
          Following: {profileData.counts.followingCount}{" "}
        </a>
      </div>
      <ProfilePosts />
    </Page>
  );
};
export default Profile;
