import React from 'react';
import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogData.js';


function BlogPage({}) {
    return (
      <main>
        <section id="blog" className="py-5 bg-light">
        <Container>
          <h2 style={{ backgroundColor: "#660ff1" }} className="section-heading text-light fw-bold mb-4 p-2 fs-1 text-center">
            Latest Blog Posts
          </h2>
          <Row xs={1} md={2} lg={3} className="g-4">
            {blogPosts.map((post) => (
              <Col key={post.id}>
                <Link to={`/blog/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Card className="blog-card h-100">
                    {post.imageUrl && <Card.Img variant="top" src={post.imageUrl} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />}
                    <Card.Body>
                      <Card.Title>{post.title}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        By {post.author} on {post.date}
                      </Card.Subtitle>
                      <Card.Text>{post.excerpt}</Card.Text>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      </main>
    );
  }

  export default BlogPage;