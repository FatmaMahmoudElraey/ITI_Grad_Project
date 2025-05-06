import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import { blogPosts } from '../data/blogData.js';

const BlogDetailsPage = () => {
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
            {post.content.split('\n').reduce((acc, line, index) => {
              const trimmedLine = line.trim();
              if (trimmedLine === '') return acc; // Skip empty lines

              // Check for headings (ends with a colon)
              if (trimmedLine.endsWith(':')) {
                acc.push(<h4 key={`h-${index}`} style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>{trimmedLine.slice(0, -1)}</h4>);
              } 
              // Check for unordered list items (starts with '- ')
              else if (trimmedLine.startsWith('- ')) {
                const listItem = <li key={`ul-${index}`} style={{ marginBottom: '0.25rem' }}>{trimmedLine.substring(2)}</li>;
                // If the previous element was not a ul, start a new one
                if (acc.length === 0 || acc[acc.length - 1].type !== 'ul') {
                  acc.push(<ul key={`ul-group-${index}`} style={{ marginTop: '0.5rem', marginBottom: '1rem', paddingLeft: '20px' }}>{listItem}</ul>);
                } else {
                  // Add to existing ul
                  const prevUl = acc[acc.length - 1];
                  acc[acc.length - 1] = React.cloneElement(prevUl, {}, [...React.Children.toArray(prevUl.props.children), listItem]);
                }
              } 
              // Check for ordered list items (starts with number, dot, space, e.g., "1. ")
              else if (/^\d+\.\s/.test(trimmedLine)) {
                const listItemContent = trimmedLine.replace(/^\d+\.\s/, '');
                const listItem = <li key={`ol-${index}`} style={{ marginBottom: '0.25rem' }}>{listItemContent}</li>;
                // If the previous element was not an ol, start a new one
                if (acc.length === 0 || acc[acc.length - 1].type !== 'ol') {
                  acc.push(<ol key={`ol-group-${index}`} style={{ marginTop: '0.5rem', marginBottom: '1rem', paddingLeft: '20px' }}>{listItem}</ol>);
                } else {
                  // Add to existing ol
                  const prevOl = acc[acc.length - 1];
                  acc[acc.length - 1] = React.cloneElement(prevOl, {}, [...React.Children.toArray(prevOl.props.children), listItem]);
                }
              } 
              // Default to paragraph
              else {
                acc.push(<p key={`p-${index}`} style={{ marginBottom: '1rem' }}>{trimmedLine}</p>);
              }
              return acc;
            }, [])}
          </div>
          <div className="mt-5 text-center">
            <Button style={{backgroundColor:"#660ff1", fontWeight:"bold"}} href="/blogs">
              ← Back to Blogs
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default BlogDetailsPage;
