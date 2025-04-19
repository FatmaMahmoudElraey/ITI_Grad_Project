import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Navbar";


export default function SharedLayout() {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    )
}
