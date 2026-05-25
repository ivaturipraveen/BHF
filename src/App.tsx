import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Values from "./components/Values";
import Events from "./components/Events";
import GetInvolved from "./components/GetInvolved";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <About />
      <Values />
      <Events />
      <GetInvolved />
      <Footer />
    </div>
  );
}
