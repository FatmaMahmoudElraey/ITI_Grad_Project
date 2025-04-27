import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Navbar";
// import FloatingChatbot from "../components/Chatbot/FloatingChatbot";


export default function SharedLayout() {
    return (
        <>
            <Header />
            <Outlet />
            {/* <FloatingChatbot /> */}
            <Footer />
        </>
    )
}
// 