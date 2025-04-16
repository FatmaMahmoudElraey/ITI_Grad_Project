import { Route, Router, Routes } from "react-router-dom";
import './App.css'
import SharedLayout from './sharedlayout/SharedLayout.jsx'


function App() {

  return (
    <Routes>
      <Route path="/" element={<SharedLayout />}></Route>
      </Routes>
  )
}

export default App
