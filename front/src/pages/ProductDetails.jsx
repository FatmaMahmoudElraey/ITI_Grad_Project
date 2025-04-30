import { Container, Row, Col, Button, Badge, Tabs, Tab, Card, Carousel, Form, Toast, ToastContainer } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BASE_URL } from '../api/constants';
import { faStar as fasStar, faStarHalfAlt as fasStarHalfAlt, faShoppingCart, faEye, faHeart, faShield, faDownload } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import TemplateCard from '../components/TemplateCard';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, fetchProducts } from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct, items: products, categories, loading, error } = useSelector(state => state.products);
  const [similarItems, setSimilarItems] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Fetch the specific product by ID
    if (id) {
      dispatch(fetchProductById(id));
    }

    // Fetch all products for similar items if not already loaded
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [id, dispatch, products.length]);



  // Find similar products when products or currentProduct changes
  useEffect(() => {
    if (currentProduct && products && products.length > 0) {
      // Find products in the same category or with similar tags
      const similar = products
        .filter(product => 
          product.id !== currentProduct.id && 
          (product.category?.id === currentProduct.category?.id ||
           product.tags?.some(tag => currentProduct.tags?.includes(tag)))
        )
        .slice(0, 3); // Limit to 3 similar products

      setSimilarItems(similar);
    }
  }, [currentProduct, products]);

  // Calculate average rating from reviews
  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  };

  // Use the fetched product data or a placeholder while loading
  const selectedProduct = currentProduct || {
    id: 0,
    title: "Loading...",
    description: "Loading product details...",
    category: { id: 0, name: "" },
    tags: [],
    images: [],
    price: 0,
    created_at: new Date().toISOString(),
    seller: { id: 0, name: "" },
    sales: 0,
    reviews: [],
    rating: 0
  };

  // Calculate average rating
  const averageRating = calculateAverageRating(selectedProduct.reviews);
  
  // Handle add to cart
  const handleAddToCart = () => {
    dispatch(addToCart({
      id: selectedProduct.id,
      template_id: selectedProduct.id,
      quantity: quantity,
      price: selectedProduct.sale_price || selectedProduct.price,
      title: selectedProduct.title,
      image: selectedProduct.images && selectedProduct.images.length > 0 ? (selectedProduct.images[0].image_url || selectedProduct.images[0].image || null) : null,
      category_name: selectedProduct.category_name
    }));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <Container className="py-5">
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} bg="success" delay={2000} autohide>
          <Toast.Header closeButton>
            <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
            <strong className="me-auto">Added to Cart</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {selectedProduct.title} has been added to your cart.
            <div className="mt-2">
              <Button size="sm" variant="light" onClick={() => navigate('/cart')}>
                View Cart
              </Button>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <Row>
        <Col lg={8}>
          <div className="product-image-container mb-4">
            <Carousel>
              {(selectedProduct.images || []).map((image, index) => (
                <Carousel.Item key={index}>
                  <img
                    src={image.image_url || image.image || "/placeholder-image.jpg"}
                    alt={`${selectedProduct.title} - Image ${index + 1}`}
                    className="d-block w-100 rounded shadow-sm"
                    style={{ maxHeight: '500px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                </Carousel.Item>
              ))}
              {(!selectedProduct.images || selectedProduct.images.length === 0) && (
                <Carousel.Item>
                  <img
                    src="/placeholder-image.jpg"
                    alt="No image available"
                    className="d-block w-100 rounded shadow-sm"
                    style={{ maxHeight: '500px', objectFit: 'cover' }}
                  />
                </Carousel.Item>
              )}
            </Carousel>
          </div>

          {selectedProduct.preview_video && (
            <div className="mb-4">
              <iframe
                width="100%"
                height="500"
                src={selectedProduct.preview_video ? 
                  `https://www.youtube.com/embed/${selectedProduct.preview_video.includes('youtu.be/') ? 
                    selectedProduct.preview_video.split('youtu.be/')[1].split('?')[0] : 
                    selectedProduct.preview_video}` : 
                  ''}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded shadow-sm"
              ></iframe>
            </div>
          )}

          <Tabs defaultActiveKey="description" id="product-tabs" className="mb-4">
            <Tab eventKey="description" title="Description">
              <div className="p-4 bg-white rounded shadow-sm">
                <h4>Description</h4>
                <p>{selectedProduct.description}</p>

                <h5 className="mt-4">Tags</h5>
                <ul>
                  {(selectedProduct.tags || []).map((tag, index) => (
                    <li key={index}>{tag}</li>
                  ))}
                </ul>
              </div>
            </Tab>

            <Tab eventKey="support" title="Support">
              <div className="p-4 bg-white rounded shadow-sm">
                <h4>Support</h4>
                <p>
                  Our team is here to help you with any questions or issues you may have with this product.
                </p>
              </div>
            </Tab>
            <Tab eventKey="reviews" title={`Reviews (${selectedProduct.reviews?.length || 0})`}>
              <div className="p-4 bg-white rounded shadow-sm">
                <div className="d-flex align-items-center mb-4">
                  <div className="me-3">
                    <h2 className="mb-0">{averageRating.toFixed(1)}</h2>
                    <div>
                      {[1, 2, 3, 4, 5].map((star) => {
                        if (star <= Math.floor(averageRating)) {
                          return <FontAwesomeIcon key={star} icon={fasStar} className="text-warning" />;
                        } else if (star === Math.ceil(averageRating) && !Number.isInteger(averageRating)) {
                          return <FontAwesomeIcon key={star} icon={fasStarHalfAlt} className="text-warning" />;
                        } else {
                          return <FontAwesomeIcon key={star} icon={farStar} className="text-warning" />;
                        }
                      })}
                    </div>
                    <small className="text-muted">{selectedProduct.reviews?.length || 0} reviews</small>
                  </div>
                  <div className="ms-auto">
                    <Button variant="outline-primary" size="sm">
                      Write a Review
                    </Button>
                  </div>
                </div>

                {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                  <div className="review-list">
                    {selectedProduct.reviews.map((review, index) => (
                      <Card key={index} className="mb-3 border-0 bg-light">
                        <Card.Body>
                          <div className="d-flex justify-content-between mb-2">
                            <div>
                              <h6 className="mb-2">{review.user || 'Anonymous'}</h6>
                              <div className="mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <FontAwesomeIcon 
                                    key={i} 
                                    icon={i < review.rating ? fasStar : farStar} 
                                    className="text-warning me-1" 
                                    size="sm"
                                  />
                                ))}
                              </div>
                            </div>
                            <small className="text-muted">
                              {new Date(review.created_at).toLocaleDateString()}
                            </small>
                          </div>
                          <p className="mb-0">{review.comment}</p>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </Col>

        <Col lg={4}>
          <div className="sticky-top" style={{ top: '100px' }}>
            <Card className="mb-4">
              <Card.Body>
                <h2 className="mb-3">{selectedProduct.title}</h2>
                <p className="text-muted mb-4">{selectedProduct.description}</p>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="fs-3 fw-bold">${selectedProduct.price}</span>
                  <div>
                    <div className="d-flex align-items-center mb-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        if (star <= Math.floor(averageRating)) {
                          return <FontAwesomeIcon key={star} icon={fasStar} className="text-warning" />;
                        } else if (star === Math.ceil(averageRating) && !Number.isInteger(averageRating)) {
                          return <FontAwesomeIcon key={star} icon={fasStarHalfAlt} className="text-warning" />;
                        } else {
                          return <FontAwesomeIcon key={star} icon={farStar} className="text-warning" />;
                        }
                      })}
                      <span className="ms-1">({selectedProduct.reviews?.length || 0})</span>
                    </div>
                    <Badge bg="success" className="px-3 py-1">
                      {(selectedProduct.sales || 0).toLocaleString()} Sales
                    </Badge>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <span className="me-3">Quantity:</span>
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setQuantity(prev => prev > 1 ? prev - 1 : 1)}
                      >
                        -
                      </Button>
                      <Form.Control
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="mx-2 text-center"
                        style={{ width: '60px' }}
                      />
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setQuantity(prev => prev + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <Button
                    style={{ backgroundColor: "#6610f2" }}
                    className="w-100 py-2 mb-2"
                    onClick={handleAddToCart}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                    Add to Cart
                  </Button>
                  {selectedProduct.live_demo_url && (
                    <Button
                      variant="outline-secondary"
                      className="w-100 py-2"
                      href={selectedProduct.live_demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FontAwesomeIcon icon={faEye} className="me-1" /> Live Demo
                    </Button>
                  )}
                </div>

                <div className="mb-4">
                  <h6>Item Details</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Seller:</span>
                    <span className="text-primary">{selectedProduct.seller?.name || 'Unknown Seller'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Category:</span>
                    {selectedProduct.category_name ? (
                      <span>{selectedProduct.category_name}</span>
                    ) : (
                      <span>Uncategorized</span>
                    )}
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Released:</span>
                    <span>{selectedProduct.created_at ? new Date(selectedProduct.created_at).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Approved:</span>
                    <span>{selectedProduct.is_approved !== undefined ? (selectedProduct.is_approved ? "Yes" : "No") : "Unknown"}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
      {similarItems.length > 0 && (
        <section className="mt-5">
          <h3 className="mb-4">You Might Also Like</h3>
          <Row>
            {similarItems.map((product) => (
              <Col md={4} key={product.id} className="mb-4">
                <TemplateCard {...product} />
              </Col>
            ))}
          </Row>
        </section>
      )}
    </Container>
  );
};

export default ProductDetailsPage;