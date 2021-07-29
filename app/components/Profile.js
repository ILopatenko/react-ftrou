import React, { useContext, useEffect } from "react";
import { useParams, NavLink, Switch, Route } from "react-router-dom";
import Page from "./Page";
import StateContext from "../StateContext";
import axios from "axios";
import ProfilePosts from "./ProfilePosts";
import ProfileFollowers from "./ProfileFollowers";
import ProfileFollowing from "./ProfileFollowing";
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

  //Fetch user's profile data from server (with handle a cancelled request)
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
    if (state.startFollowingRequestCount) {
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
    if (state.stopFollowingRequestCount) {
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
        <NavLink exact to={`/profile/${state.profileData.profileUsername}`} className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/followers`} className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/following`} className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route exact path="/profile/:username">
          <ProfilePosts />
        </Route>
        <Route path="/profile/:username/followers">
          <ProfileFollowers />
        </Route>
        <Route path="/profile/:username/following">
          <ProfileFollowing />
        </Route>
      </Switch>
    </Page>
  );
};
export default Profile;
