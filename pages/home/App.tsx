import { ReactNode, useState } from "react";
import { Helmet } from "react-helmet-async";

import styles from "./App.module.css";

export default function App(): ReactNode {
  const [count, setCount] = useState(0);

  return (
    <>
      <Helmet>
        <title>Cookies | Testing</title>
      </Helmet>
      <div
        className={`${styles.background} flex justify-center text-center flex-col text-white cursor-default select-none`}
      >
        <h1>Testing</h1>
        <p>Count: {count}</p>
        <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      </div>
    </>
  );
}
