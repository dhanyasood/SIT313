import {
    FaFacebookF,
    FaInstagram,
    FaTwitter
} from "react-icons/fa";

function Footer() {
    return (
        <footer className="footer">

            <div className="footer-section">
                <h3>Explore</h3>

                <a href="#about">About</a>
                <a href="#work">Work</a>
                <a href="#newsletter">Newsletter</a>
            </div>


            <div className="footer-section">
                <h3>Support</h3>

                <a href="#">Help</a>
                <a href="#contact">Contact</a>
            </div>


            <div className="footer-section">
                <h3>Stay Connected</h3>

                <div className="social-icons">

                    <a
                        href="https://www.facebook.com/"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Facebook"
                    >
                        <FaFacebookF />
                    </a>

                    <a
                        href="https://www.instagram.com/"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Instagram"
                    >
                        <FaInstagram />
                    </a>

                    <a
                        href="https://twitter.com/"
                        target="_blank"
                        rel="noreferrer" // This is to prevent the new page from accessing the original page
                        aria-label="Twitter"
                    >
                        <FaTwitter />
                    </a>

                </div>
            </div>


            <div className="footer-bottom">

                <p>DEV@Deakin 2022</p>

                <div className="footer-links">

                    <a href="#">Privacy Policy</a>

                    <a href="#">Terms</a>

                    <a href="#">Code of Conduct</a>

                </div>

            </div>

        </footer>
    );
}

export default Footer;