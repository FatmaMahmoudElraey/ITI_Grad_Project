import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, deleteUserAccount } from "../store/slices/usersSlice";
import axios from "axios";
import { ENDPOINTS } from "../api/constants";
import { Card, Button, Container, Modal, Form, Row, Col, Badge } from "react-bootstrap";
import { FaEdit, FaSignOutAlt, FaTrash, FaUser, FaDownload, FaCalendarAlt, FaStar, FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";
import { Navigate, useNavigate } from "react-router-dom";
import { FaLocationDot } from "react-icons/fa6";

export default function UserProfile() {
  const dispatch = useDispatch();
  const { userProfile, purchasedProducts=[], loading, error } = useSelector((state) => state.users);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("purchases");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserIdAndProfile = async () => {
      try {
        const response = await axios.get(ENDPOINTS.AUTH.ME, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        });
        dispatch(fetchUserProfile(response.data.id))
          .unwrap()
          .catch(err => {
            console.error("Failed to fetch profile:", err);
            // navigate('/login');
          });
      } catch (err) {
        console.error("Failed to fetch user ID:", err);
        // navigate('/login');
      }
    };

    fetchUserIdAndProfile();
  }, [dispatch]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile?.user?.name || "",
        bio: userProfile?.bio || "",
        location: userProfile?.location || "",
        date_of_birth: userProfile?.date_of_birth || "",
        picture: userProfile?.picture || "",
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
      await dispatch(updateUserProfile({ 
        userId: userProfile.id, 
        profileData: formData 
      })).unwrap();
      
      setShowEditModal(false);
      // Profile will be automatically updated through redux state
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteUserAccount(userProfile.id)).unwrap();
      sessionStorage.clear();
      navigate("/");
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

  // Mock purchased products data
  

  // Mock favorites data
  const favorites = [
    {
      id: 5,
      title: "Portfolio Website Template",
      image: "https://i.imgur.com/Nd4sSJz.jpg",
      author: "WebMasters",
      category: "HTML Templates",
      price: 29,
      rating: 4.7
    },
    {
      id: 6,
      title: "Mobile App UI Kit",
      image: "https://i.imgur.com/K8YzQdL.jpg",
      author: "AppDesign",
      category: "UI Templates",
      price: 49,
      rating: 4.9
    }
  ];

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your profile...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <div className="alert alert-danger">
            <h4>Error Loading Profile</h4>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={() => window.location.reload()}>
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
          overflow: "hidden"
        }}
      >
        <div
          className="position-absolute w-100 h-100"
          style={{
            backgroundImage: "url('https://i.imgur.com/xnDMCwq.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.2
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
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
              }}
            >
              <img
                src={userProfile?.picture || "https://i.imgur.com/Qtrsrk5.jpg"}
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
                <FaLocationDot className="me-1"/>
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
                  Member since {userProfile?.user?.date_joined ? new Date(userProfile?.user?.date_joined).getFullYear() : "2023"}
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
                    <p className="mb-0 fw-bold">{userProfile?.user?.name || "John Doe"}</p>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <FaLocationDot className="me-3 text-primary"/>
                  <div>
                    <small className="text-muted">Location</small>
                    <p className="mb-0">{userProfile?.location || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <FaCalendarAlt className="text-primary me-3" size={18} />
                  <div>
                    <small className="text-muted">Member Since</small>
                    <p className="mb-0">{userProfile?.user?.date_joined ? new Date(userProfile?.user?.date_joined).toLocaleDateString() : "Unknown"}</p>
                  </div>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <FaShoppingCart className="text-primary me-3" size={18} />
                  <div>
                    <small className="text-muted">Items Purchased</small>
                    <p className="mb-0 fw-bold">{purchasedProducts.length}</p>
                  </div>
                </div>
                
                <div className="d-flex align-items-center">
                  <FaDownload className="text-primary me-3" size={18} />
                  <div>
                    <small className="text-muted">Total Downloads</small>
                    <p className="mb-0 fw-bold">{purchasedProducts.reduce((sum, product) => sum + product.downloads, 0)}</p>
                  </div>
                </div>
              </Card.Body>
              <Card.Footer className="bg-white border-top-0 pb-4">
                <div className="d-grid gap-2">
                  <Button variant="outline-primary" className="d-flex align-items-center justify-content-center" onClick={handleEditProfile}>
                    <FaEdit className="me-2" /> Edit Profile
                  </Button>
                  <Button variant="outline-danger" className="d-flex align-items-center justify-content-center" onClick={() => setShowDeleteConfirm(true)}>
                    <FaTrash className="me-2" /> Delete Account
                  </Button>
                  <Button variant="danger" className="d-flex align-items-center justify-content-center" onClick={LogOut}>
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
                    className={`rounded-0 rounded-top border-0 px-4 ${activeTab === "purchases" ? "" : "text-muted"}`}
                    onClick={() => setActiveTab("purchases")}
                  >
                    <FaShoppingCart className="me-2" /> Purchased Items
                  </Button>
                  <Button 
                    variant={activeTab === "favorites" ? "primary" : "light"}
                    className={`rounded-0 rounded-top border-0 px-4 ${activeTab === "favorites" ? "" : "text-muted"}`}
                    onClick={() => setActiveTab("favorites")}
                  >
                    <FaStar className="me-2" /> Favorites
                  </Button>
                </div>
              </Card.Header>

              <Card.Body style={{ minHeight: "600px" }}>
                {activeTab === "purchases" && (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Your Purchased Items</h5>
        <Form.Control
          type="search"
          placeholder="Search purchases..."
          className="w-auto"
        />
      </div>

      {purchasedProducts.length > 0 ? (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {purchasedProducts.map((product) => (
            <div key={product.id} className="col">
              <Card className="h-100 product-card">
                <div className="position-relative">
                  <Card.Img 
                    variant="top" 
                    src={product.image || "https://placehold.co/600x400?text=No+Image"}
                    style={{ height: "160px", objectFit: "cover" }}
                  />
                  <Badge 
                    bg="primary"
                    className="position-absolute top-0 end-0 m-2"
                  >
                    {product.category}
                  </Badge>
                </div>

                <Card.Body>
                  <Card.Title className="fs-6">{product.title}</Card.Title>
                  <Card.Text className="text-muted small mb-1">
                    by {product.author}
                  </Card.Text>
                                
                                <div className="d-flex align-items-center mb-2">
                                  <div className="text-warning me-1">
                                    {Array(5).fill(0).map((_, i) => (
                                      <FaStar 
                                        key={i}
                                        size={12}
                                        className={i < Math.floor(product.rating) ? "text-warning" : "text-muted"}
                                      />
                                    ))}
                                  </div>
                                  <span className="small text-muted ms-1">{product.rating}</span>
                                </div>

                                <div className="d-flex justify-content-between small text-muted">
                                  <span>Price: ${product.price}</span>
                                  <span>Downloads: {product.downloads}</span>
                                </div>
                              </Card.Body>

                              <Card.Footer className="bg-white border-top-0 d-flex justify-content-between">
                                <small className="text-muted">
                                  Purchased on {new Date(product.purchaseDate).toLocaleDateString()}
                                </small>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                >
                                  <FaDownload className="me-1" size={12} /> Download
                                </Button>
                              </Card.Footer>
                            </Card>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <img 
                          src="https://i.imgur.com/Qtrsrk5.jpg" 
                          alt="No Purchases" 
                          style={{ width: "120px", opacity: 0.5 }}
                          className="rounded-circle mb-3"
                        />
                        <h5 className="text-muted">No items purchased yet</h5>
                        <p className="text-muted">Browse our marketplace to find amazing digital products</p>
                        <Button variant="primary">Explore Marketplace</Button>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "favorites" && (
                  <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0">Your Favorite Items</h5>
                    </div>

                    {favorites.length > 0 ? (
                      <div className="row row-cols-1 row-cols-md-3 g-4">
                        {favorites.map((product) => (
                          <div key={product.id} className="col">
                            <Card className="h-100 product-card">
                              <div className="position-relative">
                                <Card.Img 
                                  variant="top" 
                                  src={product.image}
                                  style={{ height: "160px", objectFit: "cover" }}
                                />
                                <Badge 
                                  bg="primary"
                                  className="position-absolute top-0 end-0 m-2"
                                >
                                  {product.category}
                                </Badge>
                                <Button
                                  variant="link"
                                  className="position-absolute top-0 start-0 m-2 text-danger p-0"
                                >
                                  <FaStar size={18} className="text-warning" />
                                </Button>
                              </div>

                              <Card.Body>
                                <Card.Title className="fs-6">{product.title}</Card.Title>
                                <Card.Text className="text-muted small mb-1">
                                  by {product.author}
                                </Card.Text>
                                
                                <div className="d-flex align-items-center mb-2">
                                  <div className="text-warning me-1">
                                    {Array(5).fill(0).map((_, i) => (
                                      <FaStar 
                                        key={i}
                                        size={12}
                                        className={i < Math.floor(product.rating) ? "text-warning" : "text-muted"}
                                      />
                                    ))}
                                  </div>
                                  <span className="small text-muted ms-1">{product.rating}</span>
                                </div>

                                <div className="small text-muted">
                                  <span>Price: ${product.price}</span>
                                </div>
                              </Card.Body>

                              <Card.Footer className="bg-white border-top-0">
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  className="w-100"
                                >
                                  <FaShoppingCart className="me-1" size={12} /> Purchase Now
                                </Button>
                              </Card.Footer>
                            </Card>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <img 
                          src="https://i.imgur.com/Qtrsrk5.jpg" 
                          alt="No Favorites" 
                          style={{ width: "120px", opacity: 0.5 }}
                          className="rounded-circle mb-3"
                        />
                        <h5 className="text-muted">No favorite items yet</h5>
                        <p className="text-muted">Add items to your favorites to keep track of products you like</p>
                        <Button variant="primary">Browse Products</Button>
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
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="text-primary">Edit Your Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <p className="text-muted mb-4">Update your information to personalize your account</p>
          <Form>
            <Row>
              <Col md={4} className="mb-4 d-flex flex-column align-items-center">
                <div 
                  className="position-relative mb-3"
                  style={{
                    width: "140px",
                    height: "140px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "5px solid #f8f9fa",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                  }}
                >
                  <img
                    src={
                      formData.picture 
                        ? URL.createObjectURL(formData.picture) 
                        : userProfile?.picture || "https://i.imgur.com/Qtrsrk5.jpg"
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
                      onChange={(e) => setFormData({ ...formData, picture: e.target.files[0] })}
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
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, Country"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
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
          <Modal.Title className="text-danger">Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex p-4 mb-3">
              <FaTrash className="text-danger" size={32} />
            </div>
            <h5>Are you sure?</h5>
            <p className="text-muted">This will permanently delete your account and all associated data. This action cannot be undone.</p>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-top-0 justify-content-center">
          <Button variant="outline-secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}