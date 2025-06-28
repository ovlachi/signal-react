import React, { useEffect, useState, useContext } from "react";
import Page from "./Page";
import { useImmerReducer } from "use-immer";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function ViewSinglePost() {
  const appState = React.useContext(StateContext);
  const appDispatch = React.useContext(DispatchContext);
  // Access the global state and dispatch function from context

  // Initial state for the reducer
  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      errorMessage: ""
    },
    body: {
      value: "",
      hasErrors: false,
      errorMessage: ""
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0
  };

  // Define the reducer function to manage state
  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchConplete":
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        return;
      case "titleChange":
        draft.title.value = action.value;
        return;
      case "bodyChange":
        draft.body.value = action.value;
        return;
      case "submitRequest":
        draft.sendCount++;
        return;
      case "saveRequestStarted":
        draft.isSaving = true;
        return;
      case "saveRequestFinished":
        draft.isSaving = false;
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, originalState);

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "submitRequest" });
  }

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    // Create a cancel token to cancel the request if the component unmounts

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token });
        dispatch({ type: "fetchConplete", value: response.data });
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }
    fetchPost();
    return () => {
      ourRequest.cancel();
      // Cleanup function to cancel the request if the component unmounts
    };
  }, []);

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "saveRequestStarted" });
      const ourRequest = Axios.CancelToken.source();
      // Create a cancel token to cancel the request if the component unmounts

      async function fetchPost() {
        try {
          const response = await Axios.post(`/post/${state.id}/edit`, { title: state.title.value, body: state.body.value, token: appState.user.token }, { cancelToken: ourRequest.token });
          dispatch({ type: "saveRequestFinished" });
          appDispatch({ type: "flashMessage", value: "Post updated successfully!" });
          // Dispatch a flash message to notify the user of success
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      }
      fetchPost();
      return () => {
        ourRequest.cancel();
        // Cleanup function to cancel the request if the component unmounts
      };
    }
  }, [state.sendCount]);

  if (state.isFetching) {
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );
  }

  return (
    <Page title="Edit Post">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onChange={(e) => dispatch({ type: "titleChange", value: e.target.value })} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="Add Title here" autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onChange={(e) => dispatch({ type: "bodyChange", value: e.target.value })} name="body" id="post-body" className="body-content tall-textarea form-control" placeholder="Add Content here" type="text" value={state.body.value} />
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          Save Updates
        </button>
      </form>
    </Page>
  );
}

export default ViewSinglePost;
