import React from "react";
import { useRouteError } from "react-router-dom";
import NotFoundPage from "./404";

export const ErrorPage: React.FC = () => {
  let error = useRouteError();

  let parsedError;
  if (error) {
    parsedError = error as { statusText?: string; data?: string };
  }

  return (
    parsedError?.statusText?.indexOf("Not Found") != -1 && <NotFoundPage />
  );
};
