import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Directory from "./pages/Directory";
import Admin from "./pages/Admin";
import About from "./pages/About";
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="investors" element={<Directory kind="investors" />} />
        <Route path="startups" element={<Directory kind="startups" />} />
        <Route path="builders" element={<Directory kind="builders" />} />
        <Route path="about" element={<About />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
