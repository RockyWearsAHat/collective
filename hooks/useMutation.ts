import { useState } from "react";

interface IState {
  error?: Error | null;
  loading: boolean;
}

import { useNavigate } from "react-router-dom";

export const useMutation = ({
  url,
  method = "POST",
  credentials = "same-origin"
}: {
  url: string;
  method?: string;
  credentials?: RequestCredentials;
}) => {
  const navigate = useNavigate();

  const [state, setState] = useState<IState>({
    error: null,
    loading: false
  });

  const fn = async (body?: Object | String | FormData): Promise<any> => {
    try {
      let bodyForReq = {};
      //Parse body for JSON, FormData, or no body
      if (body instanceof FormData) {
        console.log("FormData");
        bodyForReq = {
          body
        };
      } else if (body instanceof Object) {
        bodyForReq = {
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        };
      } else {
        bodyForReq = {};
      }

      setState(prevState => ({ ...prevState, loading: true }));
      const res = await fetch(url, {
        method,
        credentials,
        ...bodyForReq
      });

      setState({
        loading: false
      });

      if (res.redirected) {
        //Remove http://host.com from redirect url, navigate instead of window.location.href
        //as to only update content in outlet
        navigate(`/${res.url.split("/").slice(3).join("/")}`);
        return;
      }

      const json = await res.json();

      return json;
    } catch (error) {
      setState({
        loading: false,
        error: error as Error
      });
    }
  };

  return { ...state, fn };
};
