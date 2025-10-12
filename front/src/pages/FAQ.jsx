import React from 'react';
import { Container, Accordion } from 'react-bootstrap';

const faqData = [
    {
      id: "faq1",
      question: "What types of software products do you offer?",
      answer: "We offer a range of software solutions including productivity tools, security software, development utilities, and industry-specific applications for businesses and individuals.",
    },
    {
      id: "faq2",
      question: "How do I purchase a software license?",
      answer: "To purchase a license, simply select the product you want, choose a plan that fits your needs, and complete the checkout process. You'll receive your license key and download link via email immediately after purchase.",
    },
    {
      id: "faq3",
      question: "Can I try the software before buying?",
      answer: "Yes, most of our products come with a free trial version. You can download it from the product page and test all the core features before making a purchase.",
    },
    {
      id: "faq4",
      question: "How do I get technical support?",
      answer: "Our support team is available via email. You can also access our knowledge base and user guides for self-help. Premium support is available with selected plans.",
    },
    {
      id: "faq5",
      question: "Can I upgrade or change my plan later?",
      answer: "Absolutely! You can upgrade, downgrade, or switch plans at any time through your account dashboard. The changes will be prorated based on your current subscription.",
    },
  ];

function FAQPage({}) {
    return (
      <main>
        <section id="faq" className="py-5 faq-section">
          <Container>
            <h2 style={{ backgroundColor: "#660ff1" }} className="section-heading text-light fw-bold mb-4 p-2 fs-1 text-center">
              Frequently Asked Questions
            </h2>
            <Accordion defaultActiveKey="0" flush>
              {faqData.map((item, index) => (
                <Accordion.Item eventKey={String(index)} key={item.id}>
                  <Accordion.Header>{item.question}</Accordion.Header>
                  <Accordion.Body>{item.answer}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Container>
        </section>
      </main>
    );
  }

  export default FAQPage;