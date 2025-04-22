import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css'
import SharedLayout from './sharedlayout/SharedLayout.jsx'
import { Home } from "./pages/Home.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import ContactUs from "./pages/ContactUs.jsx";


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SharedLayout />}>
          <Route  index element={<Home />} />
          <Route path="home"  element={<Home />} />
          <Route path="about"  element={<AboutUs />} />
          <Route path="contact"  element={<ContactUs />} />
        </Route>
      </Routes>
    </BrowserRouter>
    
  )
}

export default App
