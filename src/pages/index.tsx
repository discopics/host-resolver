import type { NextPage } from "next";
import { useEffect } from "react";

const Home: NextPage = () => {
  // Redirect
  useEffect(() => {
    window.location.href = "https://disco.pics";
  }, []);
  return <></>;
};

export default Home;
