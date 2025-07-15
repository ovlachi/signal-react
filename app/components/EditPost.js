import React, { useEffect, useState, useContext } from "react";
import Page from "./Page";
import { useImmerReducer } from "use-immer";
import Axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import NotFound from "./NotFound";

function EditPost() {
  const navigate = useNavigate();
  // useNavigate hook to programmatically navigate
  // This is useful for redirecting after successful post edit

  // Access the global state and dispatch function from conte
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
    sendCount: 0,
    notFound: false
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
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++;
          // Increment sendCount to trigger the save request
        } else {
          appDispatch({ type: "flashMessage", value: "Please fix errors before submitting." });
          // Dispatch a flash message to notify the user of errors
        }
        return;
      case "saveRequestStarted":
        draft.isSaving = true;
        return;
      case "saveRequestFinished":
        draft.isSaving = false;
        return;
      case "titleRules":
        if (!action.value.trim()) {
          draft.title.hasErrors = true;
          draft.title.errorMessage = "Title cannot be empty.";
        } else if (!/^[a-zA-Z0-9 ]+$/.test(action.value)) {
          draft.title.hasErrors = true;
          draft.title.errorMessage = "Title can only include letters, numbers, and spaces.";
        } else if (action.value.length > 50) {
          draft.title.hasErrors = true;
          draft.title.errorMessage = "Title cannot exceed 50 characters.";
        } else {
          draft.title.hasErrors = false;
          draft.title.errorMessage = "";
        }
        return;
      case "bodyRules":
        if (!action.value.trim()) {
          draft.body.hasErrors = true;
          draft.body.errorMessage = "Body cannot be empty.";
        } else if (action.value.length > 1000) {
          draft.body.hasErrors = true;
          draft.body.errorMessage = "Body cannot exceed 1000 characters.";
        } else {
          draft.body.hasErrors = false;
          draft.body.errorMessage = "";
        }
        return;
      case "notFound":
        draft.notFound = true;
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, originalState);

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "titleRules", value: state.title.value });
    dispatch({ type: "bodyRules", value: state.body.value });
    // Validate the title and body before submitting
    dispatch({ type: "submitRequest" });
  }

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    // Create a cancel token to cancel the request if the component unmounts

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token });
        if (response.data) {
          dispatch({ type: "fetchConplete", value: response.data });
          // Dispatch the fetched post data to the reducer
          if (response.data.author.username !== appState.user.username) {
            appDispatch({ type: "flashMessage", value: "You do not have permission to edit this post." });
            // Dispatch a flash message if the user is not the author of the post
            navigate = "/";
            // Redirect to the home page
          }
        } else {
          dispatch({ type: "notFound" });
        }
      } catch (error) {
        console.log("Error fetching post requests:", error);
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

  if (state.notFound) {
    return (
      <NotFound />
      // Render NotFound component if the post is not found
    );
  }

  if (state.isFetching) {
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );
  }

  return (
    <Page title="Edit Post">
      <Link to={`/post/${state.id}`} className="small font-weight-bold">
        <i className="fas fa-arrow-left"></i> Back to Post
      </Link>

      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.title.errorMessage}</div>}
          <input
            onChange={(e) => {
              dispatch({ type: "titleChange", value: e.target.value });
              dispatch({ type: "titleRules", value: e.target.value });
            }}
            value={state.title.value}
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder="Add Title here"
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.body.errorMessage}</div>}
          <textarea
            onChange={(e) => {
              dispatch({ type: "bodyChange", value: e.target.value });
              dispatch({ type: "bodyRules", value: e.target.value });
            }}
            value={state.body.value}
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            placeholder="Add Content here"
            type="text"
          />
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          {state.isSaving ? "Saving..." : "Save Updates"}
        </button>
      </form>
    </Page>
  );
}

export default EditPost;
