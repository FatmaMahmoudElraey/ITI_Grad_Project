import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import SharedLayout from './sharedlayout/SharedLayout.jsx';
import { Home } from "./pages/Home.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";

// Import Seller Pages
import Dashboard from "./pages/seller/Dashboard.jsx";
import Products from "./pages/seller/Products.jsx";
import AddProduct from "./pages/seller/AddProduct.jsx";
import EditProduct from "./pages/seller/EditProduct.jsx";
import SalesReport from "./pages/seller/SalesReport.jsx";
import Payouts from "./pages/seller/Payouts.jsx";
import Reviews from "./pages/seller/Reviews.jsx";
import Inbox from "./pages/seller/Inbox.jsx";
import Orders from "./pages/seller/Orders.jsx";
import StoreSettings from "./pages/seller/StoreSettings.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import Chat from "./pages/Chat.jsx";
import ChatPage from "./pages/Users.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetailsPage from "./pages/ProductDetails.jsx";

// Import Admin Pages
import AdminLayout from "./components/Admin/AdminLayout.jsx";
import AdminProducts from "./pages/admin/Products.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminCategories from "./pages/admin/Categories.jsx";


function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SharedLayout />}>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="about"  element={<AboutUs />} />
            <Route path="contact"  element={<ContactUs />} />

            {/* Seller Pages */}
            <Route path="seller/dashboard" element={<Dashboard />} />
            <Route path="/seller/products" element={<Products />} />
            <Route path="/seller/products/add" element={<AddProduct />} />
            <Route path="/seller/products/edit/:id" element={<EditProduct />} />
            <Route path="seller/sales-report" element={<SalesReport />} />
            <Route path="seller/payouts" element={<Payouts />} />
            <Route path="seller/orders" element={<Orders />} />
            <Route path="seller/reviews" element={<Reviews />} />
            <Route path="seller/inbox" element={<Inbox />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="users" element={<ChatPage />} />
            <Route path="chat" element={<Chat />} />
            <Route path="seller/store-settings" element={<StoreSettings />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product-details/:id" element={<ProductDetailsPage />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminProducts />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
