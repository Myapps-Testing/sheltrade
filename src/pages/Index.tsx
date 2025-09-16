import { useState } from "react";
import Landing from "./Landing";
import Dashboard from "./Dashboard";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleGetStarted = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      {isLoggedIn ? (
        <Dashboard />
      ) : (
        <Landing onGetStarted={handleGetStarted} />
      )}
    </>
  );
};

export default Index;
