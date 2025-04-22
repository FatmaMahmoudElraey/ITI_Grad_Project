import React from 'react'
import { Link } from "react-router-dom";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock, 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram, 
  FaStar, 
  FaUsers, 
  FaShoppingCart, 
  FaShieldAlt,
  FaShippingFast,
  FaTags,
  FaHeadset
} from "react-icons/fa";

import img1 from '../assets/images/about/1.jpg.png'
import img2 from '../assets/images/about/2.jpg.png'
import img3 from'../assets/images/about/3.jpg.png'
import about1 from'../assets/images/about/about-1.webp'

import '../styles/about/about.css';
import AboutHero from './../components/AboutUs/AboutHero';
import AboutValues from '../components/AboutUs/AboutValues';
import AboutFeatures from '../components/AboutUs/AboutFeatures';
import AboutReadyToBuild from '../components/AboutUs/AboutReadyToBuild';
import AboutOurTeam from '../components/AboutUs/AboutOurTeam';
import AboutWhyUs from '../components/AboutUs/AboutWhyUs';

export default function AboutUs() {
  return (
    <>

    <AboutHero />
    <AboutValues />
    <AboutFeatures />
    <AboutOurTeam />
    <AboutWhyUs />
    <AboutReadyToBuild />
    
    </>
  )
}
