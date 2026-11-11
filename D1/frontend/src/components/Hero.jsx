import banner from "../assets/banner.png";

function Hero() {
    return (
        <section className="hero">
            <img
                src={banner}
                alt="DEV@Deakin banner"
            />

            <div className="hero-overlay">
                <h2>Hey, I'm Dhanya Sood.</h2>

                
            </div>
        </section>
    );
}

export default Hero;