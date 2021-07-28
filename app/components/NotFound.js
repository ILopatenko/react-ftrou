import React from "react";
import { Link } from "react-router-dom";
import Page from "./Page";
const NotFound = () => {
  return (
    <Page title="Not Found">
      <div className="text-center">
        <h2>We can not find this page!</h2>
        <p className="lead text-muted">
          Back to a <Link to="/">homepage</Link>
        </p>
      </div>
    </Page>
  );
};
export default NotFound;
