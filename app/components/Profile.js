import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import Page from "./Page";
import StateContext from "../StateContext";
import axios from "axios";
import ProfilePosts from "./ProfilePosts";
import { useImmer } from "use-immer";

const Profile = () => {
  //Implement useImmer() insted of useState
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: {
        followerCount: "",
        followingCount: "",
        postCount: "",
      },
    },
  });
  //Destructuring username from parameters to work with /profile/${username} templates
  const { username } = useParams();

  //appState - global app level state
  const appState = useContext(StateContext);

  //Fetch user's profile data from derver (with handle a cancelled request)
  useEffect(() => {
    const ourRequest = axios.CancelToken.source();
    const fetchData = async () => {
      try {
        const response = await axios.post(`/profile/${username}`, { token: appState.user.token }, { cancelToken: ourRequest.token });
        setState((draft) => {
          draft.profileData = response.data;
        });
      } catch (error) {
        console.error({ message: "Request to a server (fetch user profile) was cancelled by user!" });
      }
    };
    fetchData();
    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  //when button FOLLOW will be pushed - handler will change state.startFollowingCount
  // - and because of it this useEffect() hook will refetch data about user's profile from a server
  useEffect(() => {
    if (state.startFollowingRequestCount > 0) {
      setState((draft) => {
        draft.followActionLoading = true;
      });
      const ourRequest = axios.CancelToken.source();
      const fetchData = async () => {
        try {
          const response = await axios.post(`/addFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: ourRequest.token });
          setState((draft) => {
            draft.profileData.isFollowing = true;
            draft.profileData.counts.followerCount++;
            draft.followActionLoading = false;
          });
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.startFollowingRequestCount]);

  //when button STOP FOLLOW will be pushed - handler will change state.startFollowingCount
  // - and because of it this useEffect() hook will refetch data about user's profile from a server
  useEffect(() => {
    if (state.stopFollowingRequestCount > 0) {
      setState((draft) => {
        draft.followActionLoading = true;
      });
      const ourRequest = axios.CancelToken.source();
      const fetchData = async () => {
        try {
          const response = await axios.post(`/removeFollow/${state.profileData.profileUsername}`, { token: appState.user.token }, { cancelToken: ourRequest.token });
          setState((draft) => {
            draft.profileData.isFollowing = false;
            draft.profileData.counts.followerCount--;
            draft.followActionLoading = false;
          });
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.stopFollowingRequestCount]);

  //handler for onClick event on button FOLLOWING
  const startFollowing = () => {
    setState((draft) => {
      draft.startFollowingRequestCount++;
    });
  };

  //handler for onClick event on button STOP FOLLOWING
  const stopFollowing = () => {
    setState((draft) => {
      draft.stopFollowingRequestCount++;
    });
  };

  return (
    <Page title="Profile details">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
        {appState.loggedIn && !state.profileData.isFollowing && appState.user.username !== state.profileData.profileUsername && state.profileData.profileUsername !== "..." && (
          <button onClick={startFollowing} disabled={state.followActionLoading} className="btn btn-primary btn-sm ml-2">
            Follow <i className="fas fa-user-plus"></i>{" "}
          </button>
        )}
        {appState.loggedIn && state.profileData.isFollowing && appState.user.username !== state.profileData.profileUsername && state.profileData.profileUsername !== "..." && (
          <button onClick={stopFollowing} disabled={state.followActionLoading} className="btn btn-danger btn-sm ml-2">
            Stop Follow <i className="fas fa-user-times"></i>{" "}
          </button>
        )}
      </h2>
      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <a href="#" className="active nav-item nav-link">
          Posts: {state.profileData.counts.postCount}{" "}
        </a>
        <a href="#" className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}{" "}
        </a>
        <a href="#" className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}{" "}
        </a>
      </div>
      <ProfilePosts />
    </Page>
  );
};
export default Profile;
