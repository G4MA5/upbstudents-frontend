import React from "react";
import Carousel from "../components/Carousel";
import Categories from "../components/Categories";
import PopularDocuments from "../components/PopularDocuments";
import StayConnected from "../components/StayConnected"; // 👈 ajout

const Home: React.FC = () => {
  return (
    <div className="bg-white">
      <Carousel />
      <Categories />
      <PopularDocuments />
      <StayConnected /> {/* 👈 ajout ici */}
    </div>
  );
};

export default Home;
