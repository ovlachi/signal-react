import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Axios from "axios";
import LoadingDotsIcon from "./LoadingDotsIcon";

function ProfilePost() {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    // Create a cancel token to cancel the request if the component unmounts

    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, { cancelToken: ourRequest.token });
        setPosts(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }

    fetchPosts();
    return () => {
      ourRequest.cancel();
      // Cleanup function if needed, e.g., to cancel requests
    };
  }, []);

  if (isLoading) {
    return <LoadingDotsIcon />;
  }

  return (
    <>
      <div className="list-group">
        {posts.map((post) => {
          const date = new Date(post.createdDate);
          const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

          return (
            <Link key={post._id} to={`/post/${post._id}`} className="list-group-item list-group-item-action">
              <img className="avatar-tiny" src={post.author.avatar} alt={post.author.username} />
              <strong>{post.title} </strong>
              <span className="text-muted small">on {formattedDate} </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export default ProfilePost;
