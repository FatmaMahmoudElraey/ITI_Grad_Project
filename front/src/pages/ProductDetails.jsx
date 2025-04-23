import { Container, Row, Col, Button, Badge, Tabs, Tab, Card, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faShoppingCart, faEye, faHeart, faShield, faDownload } from '@fortawesome/free-solid-svg-icons';

const ProductDetailsPage = () => {

  const selectedProduct = {
    id: 1,
    title: "Static Product Title",
    slug: "static-product-title",
    description: "This is a static product description for demonstration purposes.",
    category: {
      id: 1,
      name: "Design",
    },
    tags: ["UI", "UX", "Graphics"],
    file: "https://example.com/files/product-file.zip",
    preview_images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&shttps://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&shttps://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&shttps://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
    ],
    preview_video: "https://youtube.com",
    live_demo_url: "https://example.com/live-demo",
    price: 49.99,
    is_in_subscription: true,
    is_approved: true,
    created_at: "2023-01-01T00:00:00Z",
    seller: {
      id: 1,
      name: "John Doe",
    },
    sales: 1200,
    rating: 4.5,
  };

  const similarItems = [
    {
      id: 2,
      title: "Similar Product 1",
      price: 29.99,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
      author: { id: 2, name: "Jane Smith" },
      category: "design",
    },
    {
      id: 3,
      title: "Similar Product 2",
      price: 39.99,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
      author: { id: 3, name: "Alice Johnson" },
      category: "design",
    },
    {
      id: 4,
      title: "Similar Product 3",
      price: 19.99,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlndpwDalSNF8TzBG6T7kGv73l0IOReNJpKw&s",
      author: { id: 4, name: "Bob Brown" },
      category: "design",
    },
  ];

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8}>
          <div className="product-image-container mb-4">
            <Carousel>
              {selectedProduct.preview_images.map((image, index) => (
                <Carousel.Item key={index}>
                  <img
                    src={image}
                    alt={`Slide ${index + 1}`}
                    className="d-block w-100 rounded shadow-sm"
                    style={{ maxHeight: '500px', objectFit: 'cover' }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          </div>

          {selectedProduct.preview_video && (
            <div className="mb-4">
              <iframe
                width="100%"
                height="500"
                src={`https://www.youtube.com/embed/${selectedProduct.preview_video.split('youtu.be/')[1].split('?')[0]}`}
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
                  {selectedProduct.tags.map((tag, index) => (
                    <li key={index}>{tag}</li>
                  ))}
                </ul>
              </div>
            </Tab>
            <Tab eventKey="reviews" title="Reviews">
              <div className="p-4 bg-white rounded shadow-sm">
                <h4>Customer Reviews</h4>
                <div className="d-flex align-items-center mb-4">
                  <div className="display-4 me-3">{selectedProduct.rating}</div>
                  <div>
                    <div className="text-warning mb-1">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className={i < Math.floor(selectedProduct.rating) ? 'text-warning' : 'text-muted'}
                        />
                      ))}
                    </div>
                    <p className="mb-0">Based on {Math.floor(selectedProduct.sales / 10)} reviews</p>
                  </div>
                </div>
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
                  <Badge bg="success" className="px-3 py-2">
                    {selectedProduct.sales.toLocaleString()} Sales
                  </Badge>
                </div>

                <div className="mb-4">
                  <Button
                    style={{ backgroundColor: "#6610f2" }}
                    className="w-100 py-2 mb-2"
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
                    <Link to={`/seller/${selectedProduct.seller.id}`}>
                      {selectedProduct.seller.name}
                    </Link>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Category:</span>
                    <Link to={`/category/${selectedProduct.category.id}`}>
                      {selectedProduct.category.name}
                    </Link>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Released:</span>
                    <span>{new Date(selectedProduct.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Approved:</span>
                    <span>{selectedProduct.is_approved ? "Yes" : "No"}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
      <section className="mt-5">
        <h3 className="mb-4">You Might Also Like</h3>
        <Row>
          {similarItems.map((product) => (
            <Col md={4} key={product.id} className="mb-4">
              <Card className="h-100 card-hover">
                <Card.Img
                  variant="top"
                  src={product.image}
                  alt={product.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title as="h5" className="mb-2">
                    <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                      {product.title}
                    </Link>
                  </Card.Title>
                  <Card.Text className="text-muted small mb-2">
                    by <Link to={`/author/${product.author.id}`} className="text-decoration-none">{product.author.name}</Link>
                  </Card.Text>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="fw-bold">${product.price}</span>
                    <Button style={{ backgroundColor: "#6610f2" }} size="sm">
                      Add to Cart
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </Container>
  );
};

export default ProductDetailsPage;