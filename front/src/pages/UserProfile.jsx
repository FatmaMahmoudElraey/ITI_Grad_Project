import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserProfile,
  deleteUserAccount,
  updateUserProfile,
  fetchUserFavorites,
} from "../store/slices/usersSlice";
import Swal from "sweetalert2";
import { createProductReview } from "../store/slices/productsSlice";
import {
  Card,
  Button,
  Container,
  Modal,
  Form,
  Row,
  Col,
  Badge,
  Alert
} from "react-bootstrap";
import {
  FaEdit,
  FaSignOutAlt,
  FaTrash,
  FaUser,
  FaDownload,
  FaCalendarAlt,
  FaStar,
  FaStar as FaStarSolid,
  FaRegStar,
  FaShoppingCart,
  FaCommentAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { FaLocationDot } from "react-icons/fa6";

export default function UserProfile() {
  const dispatch = useDispatch();
  const {
    userProfile,
    purchasedProducts = [],
    userFavorites = [],
    loading,
    error,
  } = useSelector((state) => state.users);
  const { success: reviewSuccess, error: reviewError } = useSelector((state) => state.products);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("purchases");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentProductToReview, setCurrentProductToReview] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });
  const [reviewAlert, setReviewAlert] = useState({ show: false, message: "", variant: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await dispatch(fetchUserProfile()).unwrap();
        await dispatch(fetchUserFavorites()).unwrap();
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [dispatch, navigate]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile?.user?.name || "",
        bio: userProfile?.bio || "",
        location: userProfile?.location || "",
        birth_date: userProfile?.birth_date || "",
        picture: null,
        pictureUrl: userProfile?.picture || "",
      });
    }
  }, [userProfile]);

  const LogOut = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    navigate("/");
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      // Create a clean form data object with only the fields that changed
      const cleanFormData = {
        name: formData.name,
        bio: formData.bio || "",
        location: formData.location || "",
        birth_date: formData.birth_date || "",
      };

      // Only include the picture if it's a new file
      if (formData.picture instanceof File) {
        cleanFormData.picture = formData.picture;
      }

      const updatedProfile = await dispatch(
        updateUserProfile(cleanFormData)
      ).unwrap();

      setFormData({
        name: updatedProfile.user?.name || "",
        bio: updatedProfile.bio || "",
        location: updatedProfile.location || "",
        birth_date: updatedProfile.birth_date || "",
        picture: null,
        pictureUrl: updatedProfile.picture || "",
      });

      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      Swal.fire({
        title: 'Error',
        text: `Failed to update profile: ${err.message || "Please check your form data"}`,
        icon: 'error',
        confirmButtonColor: '#660ff1'
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteUserAccount(userProfile.user.id)).unwrap();
      // Clear all session storage (tokens, etc.)
      sessionStorage.clear();
      // Show success message
      Swal.fire({
        title: 'Account Deactivated',
        text: 'Your account has been deactivated successfully. You will now be redirected to the login page.',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });
      // Redirect to login page
      navigate("/login");
    } catch (err) {
      console.error("Failed to deactivate account:", err);
      Swal.fire({
        title: 'Error',
        text: 'Failed to deactivate your account. Please try again or contact support.',
        icon: 'error',
        confirmButtonColor: '#660ff1'
      });
    }
  };

  const handleReviewProduct = (product) => {
    setCurrentProductToReview(product);
    setReviewData({
      rating: 5,
      comment: "",
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    try {
      if (!currentProductToReview) return;
      
      console.log('Submitting review for product:', currentProductToReview);
      
      // Make sure we have a valid product ID
      if (!currentProductToReview.id) {
        throw new Error('Invalid product ID');
      }
      
      // Submit review via axios; cookies will be sent automatically
      const response = await axios.post(ENDPOINTS.PRODUCT_REVIEWS, {
        product: currentProductToReview.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      console.log('Review submitted successfully:', data);
      
      setShowReviewModal(false);
      setReviewAlert({
        show: true,
        message: "Review submitted successfully!",
        variant: "success",
      });
      
      // Hide alert after 3 seconds
      setTimeout(() => {
        setReviewAlert({ show: false, message: "", variant: "success" });
      }, 3000);
    } catch (err) {
      setReviewAlert({
        show: true,
        message: err.message || "Failed to submit review",
        variant: "danger",
      });
    }
  };

  const handleDownload = async (productId) => {
    try {
      // Use axios to download (cookies sent automatically)
      const response = await axios.get(`${ENDPOINTS.PRODUCTS}${productId}/download/`, {
        responseType: 'blob'
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Get the filename from the Content-Disposition header if available
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `product-${productId}.zip`; // Default filename

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Convert the response to a blob
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;

      // Append the link to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the blob URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      Swal.fire({
        title: 'Download Failed',
        text: `Failed to download file: ${error.message}`,
        icon: 'error',
        confirmButtonColor: '#660ff1'
      });
    }
  };

  // Mock favorites data
  // const favorites = [
  //   {
  //     id: 5,
  //     title: "Portfolio Website Template",
  //     image: "https://i.imgur.com/Nd4sSJz.jpg",
  //     author: "WebMasters",
  //     category: "HTML Templates",
  //     price: 29,
  //     rating: 4.7
  //   },
  //   {
  //     id: 6,
  //     title: "Mobile App UI Kit",
  //     image: "https://i.imgur.com/K8YzQdL.jpg",
  //     author: "AppDesign",
  //     category: "UI Templates",
  //     price: 49,
  //     rating: 4.9
  //   }
  // ];

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your profile...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <div className="alert alert-danger">
            <h4>Error Loading Profile</h4>
            <p>{error}</p>
            <Button
              variant="outline-danger"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-0">
      {/* Hero Banner Section */}
      <div
        className="position-relative"
        style={{
          background: "linear-gradient(135deg, #7b1e4a, #360f68)",
          height: "250px",
          overflow: "hidden",
        }}
      >
        <div
          className="position-absolute w-100 h-100"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/430207/pexels-photo-430207.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.2,
          }}
        />
        <Container className="h-100 d-flex flex-column justify-content-end">
          <div className="d-flex align-items-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="position-relative"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "5px solid white",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
            >
              <img
                src={
                  userProfile?.picture
                    ? userProfile.picture.startsWith("http")
                      ? userProfile.picture
                      : `${
                          import.meta.env.VITE_API_BASE_URL}${userProfile.picture}`
                    : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAb-vb97QXQeIb-chQJOKk3XouQGSsyrakSw&s"
                }
                alt="Profile"
                className="w-100 h-100 object-fit-cover"
              />

              <div
                className="position-absolute bottom-0 end-0 p-1 bg-primary rounded-circle"
                style={{ cursor: "pointer" }}
                onClick={handleEditProfile}
              >
                <FaEdit color="white" size={16} />
              </div>
            </motion.div>
            <div className="ms-4 text-white">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="fw-bold mb-0"
              >
                {userProfile?.user?.name || "John Doe"}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="d-flex align-items-center"
              >
                <FaLocationDot className="me-1" />
                {userProfile?.location || "Unknown Location"}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="d-flex align-items-center mt-2"
              >
                <Badge bg="light" text="dark" className="me-2">
                  <FaShoppingCart className="me-1" size={12} />
                  {purchasedProducts.length} Items
                </Badge>
                <Badge bg="light" text="dark">
                  <FaStar className="me-1" size={12} />
                  Member since{" "}
                  {userProfile?.user?.date_joined
                    ? new Date(userProfile?.user?.date_joined).getFullYear()
                    : "2023"}
                </Badge>
              </motion.div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-5">
        <Row>
          {/* Left Column - User Info */}
          <Col lg={3}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white border-bottom-0 pt-4">
                <h5 className="fw-bold text-center">Account Details</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <FaUser className="text-primary me-3" size={18} />
                  <div>
                    <small className="text-muted">Full Name</small>
                    <p className="mb-0 fw-bold">
                      {userProfile?.user?.name || "John Doe"}
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <FaLocationDot className="me-3 text-primary" />
                  <div>
                    <small className="text-muted">Location</small>
                    <p className="mb-0">
                      {userProfile?.location || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <FaLocationDot className="me-3 text-primary" />
                  <div>
                    <small className="text-muted">Date of birth</small>
                    <p className="mb-0">
                      {userProfile?.birth_date || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <FaCalendarAlt className="text-primary me-3" size={18} />
                  <div>
                    <small className="text-muted">Member Since</small>
                    <p className="mb-0">
                      {userProfile?.user?.date_joined
                        ? new Date(userProfile?.user?.date_joined).getFullYear()
                        : "2023"}
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <FaShoppingCart className="text-primary me-3" size={18} />
                  <div>
                    <small className="text-muted">Items Purchased</small>
                    <p className="mb-0 fw-bold">{purchasedProducts.length}</p>
                  </div>
                </div>
              </Card.Body>
              <Card.Footer className="bg-white border-top-0 pb-4">
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-primary"
                    className="d-flex align-items-center justify-content-center"
                    onClick={handleEditProfile}
                  >
                    <FaEdit className="me-2" /> Edit Profile
                  </Button>
                  <Button
                    variant="outline-danger"
                    className="d-flex align-items-center justify-content-center"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <FaTrash className="me-2" /> Deactivate Account
                  </Button>
                  <Button
                    variant="danger"
                    className="d-flex align-items-center justify-content-center"
                    onClick={LogOut}
                  >
                    <FaSignOutAlt className="me-2" /> Logout
                  </Button>
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* Right Column - Purchased Items & Favorites */}
          <Col lg={9}>
            <Card className="shadow-sm">
              <Card.Header className="bg-white pt-3">
                <div className="d-flex border-bottom">
                  <Button
                    variant={activeTab === "purchases" ? "primary" : "light"}
                    className={`rounded-0 rounded-top border-0 px-4 ${
                      activeTab === "purchases" ? "" : "text-muted"
                    }`}
                    onClick={() => setActiveTab("purchases")}
                  >
                    <FaShoppingCart className="me-2" /> Your Orders
                  </Button>

                </div>
              </Card.Header>

              <Card.Body style={{ minHeight: "600px" }}>
                {activeTab === "purchases" && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0">Your Purchased Items</h5>
                      
                    </div>

                    {userProfile?.orders?.length > 0 ? (
                      userProfile.orders.map((order) => (
                        <div
                          key={order.id}
                          style={{
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            padding: "1rem",
                            marginBottom: "1.5rem",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          }}
                        >
                          

                          {order.items?.map((item) => (
                            <div key={item.id} className="mb-3">
                              {/* Header Row */}
                              <div className="d-flex justify-content-between text-muted border-bottom pb-2 small fw-semibold">
                                <div style={{ flex: 2 }}>Product</div>
                                <div
                                  className="text-center"
                                  style={{ flex: 1 }}
                                >
                                  Quantity
                                </div>
                                <div className="text-end" style={{ flex: 1 }}>
                                  Price
                                </div>
                              </div>

                              {/* Item Row */}
                              <div className="d-flex justify-content-between align-items-center mt-2 fs-6">
                                <div style={{ flex: 2 }}>
                                  {item.product?.title}
                                </div>
                                <div
                                  className="text-center"
                                  style={{ flex: 1 }}
                                >
                                  {item.quantity}
                                </div>
                                <div className="text-end" style={{ flex: 1 }}>
                                  ${item.product.price}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-3 d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  className="flex-grow-1 d-flex justify-content-center align-items-center"
                                  onClick={() =>
                                    handleDownload(item.product.id)
                                  }
                                >
                                  <FaDownload className="me-2" size={14} />{" "}
                                  Download
                                </Button>
                                <Button
                                  variant="outline-success"
                                  className="flex-grow-1 d-flex justify-content-center align-items-center"
                                  onClick={() => handleReviewProduct(item.product)}
                                >
                                  <FaCommentAlt className="me-2" size={14} />{" "}
                                  Review Product
                                </Button>
                              </div>
                              <Modal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Review {currentProductToReview?.title || "Product"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewAlert.show && (
            <Alert variant={reviewAlert.variant} className="mb-3">
              {reviewAlert.message}
            </Alert>
          )}
          
          <Form>
            <Form.Group className="mb-4">
              <Form.Label>Your Rating</Form.Label>
              <div className="d-flex gap-2 fs-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    onClick={() => setReviewData({...reviewData, rating: star})}
                    style={{ cursor: 'pointer' }}
                  >
                    {star <= reviewData.rating ? (
                      <FaStarSolid className="text-warning" />
                    ) : (
                      <FaRegStar className="text-warning" />
                    )}
                  </span>
                ))}
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Your Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={reviewData.comment}
                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                placeholder="Share your experience with this product..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitReview}
            disabled={!reviewData.comment.trim()}
          >
            Submit Review
          </Button>
        </Modal.Footer>
      </Modal>
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-5">
                        <img
                          src="https://i.imgur.com/Qtrsrk5.jpg"
                          alt="No Purchases"
                          style={{ width: "120px", opacity: 0.5 }}
                          className="rounded-circle mb-3"
                        />
                        <h5 className="text-muted">No orders yet</h5>
                        <p className="text-muted">
                          Browse our marketplace to find amazing digital
                          products
                        </p>
                        <Button variant="primary">
                          <Link to="/shop" className="text-white">
                           Explore Marketplace
                          </Link>
                          </Button>
                      </div>
                    )}
                  </>
                )}

                
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Edit Profile Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="text-primary">Edit Your Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <p className="text-muted mb-4">
            Update your information to personalize your account
          </p>
          <Form>
            <Row>
              <Col
                md={4}
                className="mb-4 d-flex flex-column align-items-center"
              >
                <div
                  className="position-relative mb-3"
                  style={{
                    width: "140px",
                    height: "140px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "5px solid #f8f9fa",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={
                      formData.picture
                        ? URL.createObjectURL(formData.picture)
                        : formData.pictureUrl
                        ? formData.pictureUrl.startsWith("http")
                          ? formData.pictureUrl
                          : `${
                              import.meta.env.VITE_API_BASE_URL}${formData.pictureUrl}`
                        : "https://i.imgur.com/Qtrsrk5.jpg"
                    }
                    alt="Profile Preview"
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
                <Form.Group>
                  <Form.Label className="btn btn-sm btn-outline-primary">
                    <FaEdit className="me-2" /> Change Picture
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          setFormData({
                            ...formData,
                            picture: e.target.files[0],
                          });
                        }
                      }}
                      className="d-none"
                    />
                  </Form.Label>
                </Form.Group>
              </Col>

              <Col md={8}>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Your full name"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Location</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="City, Country"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            birth_date: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        placeholder="Tell others about yourself..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-top-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveProfile}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        centered
        size="sm"
      >
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title className="text-danger">Deactivate Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex p-4 mb-3">
              <FaTrash className="text-danger" size={32} />
            </div>
            <h5>Are you sure?</h5>
            <p className="text-muted">
              This will deactivate your account, preventing you from logging in.
              Your data will remain in the database but you will no longer have access to the platform.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-top-0 justify-content-center">
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Deactivate Account
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}