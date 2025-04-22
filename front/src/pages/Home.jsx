
import Hero from '../components/Home/Hero';
import StateSection from '../components/Home/StateSection';
import Testimonials from '../components/Home/Testimonials';
import FeaturedTemplates from '../components/Home/FeaturedTemplates';
import CategoriesSection from '../components/Home/CategoriesSection';

export function Home() {
  return (
    <>
      <Hero />
      <StateSection />
      <CategoriesSection />
      <FeaturedTemplates />
      <Testimonials />
      
    </>
  );
}
