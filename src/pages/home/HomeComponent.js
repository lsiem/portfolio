import React from "react";
import Header from "../../components/header/Header";
import Greeting from "../../containers/greeting/Greeting";
import Skills from "../../containers/skills/Skills";
import TopButton from "../../components/topButton/TopButton";

export default function Home() {
  return (
    <div>
      <Header />
      <Greeting />
      <Skills />
      <TopButton />
    </div>
  );
}
