import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';

const BlogDetailsPage = ({ blogPosts }) => {
  const { id } = useParams();
  const post = blogPosts.find((post) => post.id === parseInt(id));

  if (!post) {
    return (
      <Container className="py-5 text-center">
        <h2>Blog post not found</h2>
        <Button variant="primary" href="/">Go Back to Home</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          <h1 className="mb-3">{post.title}</h1>
          <p className="text-muted mb-4">
            By <strong>{post.author}</strong> | {post.date}
          </p>
          <Image 
            src={post.imageUrl} 
            alt={post.title} 
            fluid 
            className="rounded mb-4" 
            style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
          />
          <div className="blog-content" style={{ lineHeight: "1.8", fontSize: "1.1rem", textAlign: "justify" }}>
            <p>{post.excerpt}</p>
            {/* Simulated full content - you can replace or append more paragraphs here */}
            <p>
              This article highlights the key features that make each template or code snippet effective. Whether you're launching a SaaS, creating a landing page, or building your design toolkit, these marketplace picks offer top-tier performance and flexibility.
            </p>
            <p>
              Stay tuned for more in-depth reviews and marketplace insights to help you choose the best assets for your next project.
            </p>
          </div>
          <div className="mt-5 text-center">
            <Button style={{backgroundColor:"#660ff1", fontWeight:"bold"}} href="/blog">
              ← Back to Blogs
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default BlogDetailsPage;
