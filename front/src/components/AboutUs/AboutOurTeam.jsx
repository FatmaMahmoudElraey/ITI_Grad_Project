import { Container, Row, Col, Card } from "react-bootstrap";
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// import required modules
import { Navigation, Pagination, Mousewheel, Keyboard } from 'swiper/modules';

import img1 from '../../assets/images/about/1.jpg.png'
import img2 from '../../assets/images/about/Untitled.jpeg'
import img3 from'../../assets/images/about/hosam.jpeg'
import img4 from'../../assets/images/about/fatma.jpeg'
import img5 from'../../assets/images/about/bendary.jpeg'

import '../../styles/about/about.css';

export default function AboutOurTeam() {
  const teamMembers = [
    {
      img: img1,
      name: "Hussien Mahmoud",
      title: "Software Engineer"
    },
    {
      img: img2,
      name: "Mohamed Loai",
      title: "CEO"
    },
    {
      img: img3,
      name: "Hosam Semry",
      title: "CTO"
    },
    {
      img: img4, 
      name: "Fatma Mahmoud",
      title: "AI Engineer"
    },
    {
      img: img5, 
      name: "Ahmed Elbendary",
      title: "Frontend Engineer"
    }
  ];

  return (
    <>
        <Container className="my-5 text-center">
          <h2 className="fw-bold " style={{ color: '#660ff1' }}>Meet Our Team</h2>
          <p className="text-muted">Dedicated professionals making your shopping better.</p>
          <Swiper
            cssMode={true}
            navigation={true}
            pagination={{ clickable: true }}
            mousewheel={true}
            keyboard={true}
            slidesPerView={1}
            spaceBetween={30}
            breakpoints={{
              // when window width is >= 768px
              768: {
                slidesPerView: 2,
                spaceBetween: 40
              },
              // when window width is >= 992px
              992: {
                slidesPerView: 3,
                spaceBetween: 50
              }
            }}
            modules={[Navigation, Pagination, Mousewheel, Keyboard]}
            className="mySwiper py-5"
          >
            {teamMembers.map((member, index) => (
              <SwiperSlide key={index} className="pb-5 px-2">
                <Card className="shadow border-0 p-4 h-100">
                  <Card.Img
                    variant="top"
                    src={member.img}
                    className="rounded-circle mx-auto mb-3"
                    style={{ width: "120px", height: "120px", objectFit: "cover" }}
                  />
                  <Card.Body className="text-center">
                    <h5 className="fw-bold">{member.name}</h5>
                    <p className="text-muted">{member.title}</p>
                  </Card.Body>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </Container>
    </>
  )
}
