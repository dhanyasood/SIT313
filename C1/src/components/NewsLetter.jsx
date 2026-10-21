function Newsletter() {
    return (
        <section id="newsletter" className="newsletter">
            <h2>SIGN UP FOR OUR DAILY INSIDER</h2>

            <p>
                Subscribe to receive the latest updates from DEV@Deakin.
            </p>

            <form>
                <input
                    type="email"
                    placeholder="Enter your email address"
                />

                <button type="submit">
                    Subscribe
                </button>
            </form>
        </section>
    );
}

export default Newsletter;