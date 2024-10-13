import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import LoginPage from "./pages/auth/login/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();   
        
        if(data.error) return null
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return (
    <div className="flex max-w-6xl mx-auto">
      {user && <Sidebar />}
      <Routes>
  <Route
    path="/"
    element={user ? <HomePage /> : <Navigate to="/login" />}
  />
  <Route
    path="/signup"
    element={!user ? <SignUpPage /> : <Navigate to="/" />}
  />
  <Route
    path="/login"
    element={!user ? <LoginPage /> : <Navigate to="/" />}
  />
  <Route
    path="/notifications"
    element={user ? <NotificationPage /> : <Navigate to="/login" />}
  />
  <Route
    path="/profile/:username"
    element={user ? <ProfilePage /> : <Navigate to="/login" />}
  />
</Routes>

      {user && <RightPanel />}
      <Toaster />
    </div>
  );
}

export default App;
