import React from "react";
import Header from "../../components/header/Header";
import Greeting from "../../containers/greeting/Greeting";
import Skills from "../../containers/skills/Skills";
import TopButton from "../../components/topButton/TopButton";

const Home: React.FC = () => {
  return (
    <div>
      <Header />
      <Greeting />
      <Skills />
      <TopButton />
    </div>
  );
};

export default Home;
