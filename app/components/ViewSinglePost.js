import React, { useEffect, useState, useContext } from "react";
import Page from "./Page";
import Axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import ReactMarkdown from "react-markdown";
import { Tooltip as ReactTooltip } from "react-tooltip";
import NotFound from "./NotFound"; // Import NotFound component to handle cases where the post is not found
import StateContext from "../StateContext"; // Import StateContext to access global state
import DispatchContext from "../DispatchContext"; // Import DispatchContext to dispatch actions

// This component is responsible for displaying a single post based on its ID
function ViewSinglePost() {
  const navigate = useNavigate(); // Use useNavigate hook to programmatically navigate
  const appState = React.useContext(StateContext); // Access the global state using StateContext
  const appDispatch = React.useContext(DispatchContext); // Access the dispatch function using DispatchContext
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    // Create a cancel token to cancel the request if the component unmounts

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token });
        setPost(response.data);
        setIsLoading(false);
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

  if (!post && !isLoading) {
    return <NotFound />; // Render NotFound component if the post is not found and not loading
  }

  if (isLoading) {
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );
  }

  const date = new Date(post.createdDate);
  const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  function isOwner() {
    if (appState.loggedIn && appState.user) {
      return appState.user.username === post.author.username;
      // Compare the logged-in user's username with the post author's username
      // to determine if the user is the owner of the post
    }
    return false;
    // Check if the logged-in user is the owner of the post
  }

  // Function to handle the deletion of the post
  async function deleteHandler() {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    // Ask the user for confirmation before deleting the post
    if (confirmDelete) {
      try {
        const response = await Axios.delete(`/post/${post._id}`, { data: { token: appState.user.token } });
        if (response.data === "Success") {
          // 1. display a success message
          appDispatch({ type: "flashMessage", value: "Post deleted successfully." });
          // 2. redirect the user to the homepage
          navigate(`/profile/${appState.user.username}`);
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  }

  // Render the single post view
  return (
    <Page title={post.title}>
      <div className="container container--narrow py-md-5">
        <div className="d-flex justify-content-between">
          <h2>{post.title}</h2>
          {isOwner() && (
            // Only show edit and delete options if the user is the owner of the post
            <span className="pt-2">
              <Link to={`/post/${post._id}/edit`} data-tooltip-content="Edit Post" data-tooltip-id="edit" className="text-primary mr-2">
                <i className="fas fa-edit"></i>
              </Link>
              <ReactTooltip id="edit" className="custom-tooltip" />{" "}
              <Link onClick={deleteHandler} to="#" data-tooltip-content="Delete Post" data-tooltip-id="delete" className="delete-post-button text-danger">
                <i className="fas fa-trash"></i>
              </Link>
              <ReactTooltip id="delete" className="custom-tooltip" />
            </span>
          )}
        </div>

        <p className="text-muted small mb-4">
          <Link to={`/profile/${post.author.username}`}>
            <img className="avatar-tiny" src={post.author.avatar} />
          </Link>
          Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {formattedDate}
        </p>

        <div className="body-content">
          <ReactMarkdown children={post.body} allowedElements={["p", "br", "strong", "em", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li"]} />
        </div>
      </div>
    </Page>
  );
}

export default ViewSinglePost;
