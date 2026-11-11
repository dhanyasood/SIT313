
import { useState } from "react";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Subscription failed.");
      }

      setMessage(data.message || "Subscription successful!");
      setEmail("");
    } catch (error) {
      setMessage(
        error.message || "Unable to connect. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="newsletter" className="newsletter">
      <h2>Subscribe to our Newsletter</h2>

      <p>
        Subscribe to receive the latest updates from DEV@Deakin.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email address"
          aria-label="Email address"
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
    </section>
  );
}

export default Newsletter;
