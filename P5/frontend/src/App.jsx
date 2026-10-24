
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";


import Header from "./components/Header";
import Hero from "./components/Hero";
import Profile from "./components/Profile";
import Projects from "./components/projects";
import FeaturedArticles from "./components/FeaturedArticles";
import FeaturedTutorials from "./components/FeaturedTutorials";
import Newsletter from "./components/NewsLetter";
import Footer from "./components/Footer";

import Login from "./pages/Login";
import Signup from "./pages/SignUp";

import "./App.css";

function Home() {
    return (
        <>
            <Hero />
            <Profile />
            <Projects />
            <FeaturedArticles />
            <FeaturedTutorials />
            <Newsletter />
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Header />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Routes>

            <Footer />
        </BrowserRouter>
    );
}

export default App;
