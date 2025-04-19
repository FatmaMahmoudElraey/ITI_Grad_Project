import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaDownload, FaUsers, FaStar, FaArrowRight } from 'react-icons/fa';
import Hero from '../components/Home/Hero';
import BrowseCategories from '../components/Home/BrowseCategories';
import StateSection from '../components/Home/StateSection';
// import TemplateCard from '../components/Home/TemplateCard';
import Testimonials from '../components/Home/Testimonials';

export function Home() {
  return (
    <>
      {/* Hero Section */}
      <Hero />
      <BrowseCategories />
      <StateSection />
      <Testimonials />
      {/* <TemplateCard /> */}
      
      

    </>
  );
}
