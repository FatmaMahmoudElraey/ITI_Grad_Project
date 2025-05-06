import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import SharedLayout from "./sharedlayout/SharedLayout.jsx";
import { Home } from "./pages/Home.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import CategoryProducts from "./pages/CategoryProducts";
import ActivateAccount from "./pages/ActivateAccount.jsx";
import Categories from "./pages/Categories";

// Import Seller Pages
import Dashboard from "./pages/seller/Dashboard.jsx";
import Products from "./pages/seller/Products.jsx";
import AddProduct from "./pages/seller/AddProduct.jsx";
import EditProduct from "./pages/seller/EditProduct.jsx";
import Reviews from "./pages/seller/Reviews.jsx";
import Orders from "./pages/seller/Orders.jsx";

import UserProfile from "./pages/UserProfile.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetailsPage from "./pages/ProductDetails.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import BlogDetailsPage from "./pages/BlogDetailsPage.jsx";
import BlogFAQPage from "./pages/BlogFAQPage.jsx";

// Import Admin Pages
import AdminLayout from "./components/Admin/AdminLayout.jsx";
import AdminProducts from "./pages/admin/Products.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminCategories from "./pages/admin/Categories.jsx";

// Import Protected Routes
import AdminRoute from "./components/ProtectedRoutes/AdminRoute.jsx";
import SellerRoute from "./components/ProtectedRoutes/SellerRoute.jsx";
import AuthLoader from "./components/AuthLoader.jsx";
import GoogleCallback from "./pages/GoogleCallback";
import PaymentResult from "./pages/PaymentResult";

function App() {
  return (
    <AuthLoader>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SharedLayout />}>
            <Route index element={<Home />} />
            <Route path="home" element={<Home />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="activate/:uid/:token" element={<ActivateAccount />} />
            <Route path="blogs" element={<BlogFAQPage />} />
            <Route path="blog/:id" element={<BlogDetailsPage />} />
            <Route path="shop" element={<Shop />} />
            <Route
              path="product-details/:id"
              element={<ProductDetailsPage />}
            />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route
              path="/category/:categoryName"
              element={<CategoryProducts />}
            />
            <Route path="/google-callback" element={<GoogleCallback />} />
            <Route path="/all-categories" element={<Categories />} />
            <Route path="/payment-result" element={<PaymentResult />} />
            <Route path="search" element={<SearchPage />} />
          </Route>

          {/* Seller Routes - Protected by SellerRoute */}
          <Route element={<SellerRoute />}>
            <Route path="/" element={<SharedLayout />}>
              <Route path="seller/dashboard" element={<Dashboard />} />
              <Route path="/seller/products" element={<Products />} />
              <Route path="/seller/products/add" element={<AddProduct />} />
              <Route
                path="/seller/products/edit/:id"
                element={<EditProduct />}
              />
              <Route path="seller/orders" element={<Orders />} />
              <Route path="seller/reviews" element={<Reviews />} />
            </Route>
          </Route>

          {/* Admin Routes - Protected by AdminRoute */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminProducts />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthLoader>
  );
}

export default App;
