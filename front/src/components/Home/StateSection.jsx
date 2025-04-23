import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaDownload, FaStar, FaUsers } from 'react-icons/fa';
import CountUp from 'react-countup'; // First install: npm install react-countup
import '../../styles/home/statsSection.css';

export default function StateSection() {
  const stats = [
    {
      icon: FaDownload,
      count: 10000,
      suffix: '+',
      label: 'Downloads',
      gradient: 'download-gradient'
    },
    {
      icon: FaUsers,
      count: 50000,
      suffix: '+',
      label: 'Happy Customers',
      gradient: 'users-gradient'
    },
    {
      icon: FaStar,
      count: 4.8,
      suffix: '/5',
      label: 'Average Rating',
      gradient: 'rating-gradient'
    }
  ];

  return (
    <div className="stats-section py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <Container>
        <Row className="text-center g-4">
          {stats.map((stat, index) => (
            <Col md={4} key={index}>
              <Card className="stat-card h-100 border-0 py-4 px-3">
                <Card.Body>
                  <div className={`icon-wrapper mb-3 ${stat.gradient}`}>
                    <stat.icon size={40} className="text-white" />
                  </div>
                  <h2 className="stat-number mb-2">
                    <CountUp
                      end={stat.count}
                      decimals={stat.count % 1 !== 0 ? 1 : 0}
                      duration={2.5}
                    />
                    {stat.suffix}
                  </h2>
                  <p className="stat-label mb-0">{stat.label}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}
