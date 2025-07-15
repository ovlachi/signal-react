import React from "react";
import Page from "./Page";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <Page title="Not Found">
      <div className="text-center">
        <h2 className="text-danger">Whoops, Page not found.</h2>
        <p className="lead text-muted">
          The post you are trying to edit does not exist. Please visit{" "}
          <Link to="/" className="font-weight-bold">
            homepage
          </Link>{" "}
          to get a fresh start.
        </p>
      </div>
    </Page>
  );
}

export default NotFound;
