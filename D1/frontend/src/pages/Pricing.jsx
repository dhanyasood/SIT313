
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "A great place to start.",
    features: [
      "5 posts per month",
      "Access to standard posts",
      "Basic profile customisation",
      "Community access",
    ],
  },
  {
    name: "Paid",
    price: "$9.99",
    description: "More opportunities to share and learn.",
    features: [
      "50 posts per month",
      "Access to premium posts",
      "Advanced profile customisation",
      "Priority content access",
    ],
  },
];

function Pricing() {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("Free");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [cardholder, setCardholder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(true);
      setSuccess("");
      setError("");

      if (!currentUser) {
        setPlan("Free");
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userRef);

        setPlan(
          userSnapshot.exists() && userSnapshot.data().plan === "Paid"
            ? "Paid"
            : "Free"
        );
      } catch (err) {
        console.error("Could not load subscription:", err);
        setError("Could not load your plan. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  function resetForm() {
    setCardholder("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setError("");
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    resetForm();
  }

  async function handleUpgrade(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("Please log in before upgrading.");
      return;
    }

    if (plan === "Paid") {
      setError("Your account is already on the Paid plan.");
      return;
    }

    const digits = cardNumber.replace(/\D/g, "");

    if (cardholder.trim().length < 2) {
      setError("Please enter the cardholder name.");
      return;
    }

    if (!/^\d{16}$/.test(digits)) {
      setError("Enter a 16-digit demo card number.");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setError("Enter expiry in MM/YY format.");
      return;
    }

    const [month, year] = expiry.split("/").map(Number);
    const currentDate = new Date();
    const fullYear = 2000 + year;

    if (
      fullYear < currentDate.getFullYear() ||
      (fullYear === currentDate.getFullYear() &&
        month < currentDate.getMonth() + 1)
    ) {
      setError("The demo expiry date must be in the future.");
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      setError("Enter a 3- or 4-digit demo security code.");
      return;
    }

    setSaving(true);

    try {
      // Send the signed-in user's Firebase ID token to the backend.
      const idToken = await user.getIdToken();

      const response = await fetch("http://localhost:3000/upgrade-plan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to upgrade your plan.");
      }

      setPlan("Paid");
      setSuccess(data.message || "Your account has been upgraded!");
      setModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Upgrade failed:", err);

      setError(
        err instanceof TypeError
          ? "Cannot connect to the backend. Make sure it is running."
          : err.message || "Unable to upgrade your plan. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="pricing-page">
      <section className="pricing-intro">
        <p className="pricing-eyebrow">DEV@DEAKIN MEMBERSHIP</p>
        <h1>Choose Your Plan</h1>
        <p>
          Whether you're getting started or ready to grow, choose the
          membership that suits your journey.
        </p>
      </section>

      {user && (
        <p className="pricing-welcome">
          Welcome, {user.displayName || user.email}
        </p>
      )}

      {success && (
        <p className="pricing-success" role="status">
          {success}
        </p>
      )}

      {error && !modalOpen && (
        <p className="pricing-error" role="alert">
          {error}
        </p>
      )}

      <section className="pricing-grid" aria-label="Subscription plans">
        {plans.map((item) => {
          const isPaid = item.name === "Paid";

          return (
            <article
              className={`pricing-card ${
                isPaid ? "pricing-card-featured" : ""
              }`}
              key={item.name}
            >
              {isPaid && (
                <span className="pricing-badge">MORE FEATURES</span>
              )}

              <h2>{item.name}</h2>
              <p className="pricing-description">{item.description}</p>

              <p className="pricing-price">
                {item.price}
                {isPaid && <span> / month</span>}
              </p>

              <p className="pricing-period">
                {isPaid ? "Demo subscription price" : "Forever"}
              </p>

              <ul className="pricing-features">
                {item.features.map((feature) => (
                  <li key={feature}>
                    <span aria-hidden="true">✓</span> {feature}
                  </li>
                ))}
              </ul>

              {!isPaid ? (
                <div className="pricing-current">Free plan available</div>
              ) : loading ? (
                <button className="pricing-button" disabled>
                  Checking account...
                </button>
              ) : !user ? (
                <Link className="pricing-button" to="/login">
                  Log in to Upgrade
                </Link>
              ) : plan === "Paid" ? (
                <button className="pricing-button" disabled>
                  Current Plan: Paid
                </button>
              ) : (
                <button
                  className="pricing-button"
                  type="button"
                  onClick={() => {
                    setError("");
                    setModalOpen(true);
                  }}
                >
                  Upgrade Plan
                </button>
              )}
            </article>
          );
        })}
      </section>

      <section className="pricing-note">
        <h2>Membership information</h2>
        <p>
          This is a demonstration checkout. No payment is processed.
          The form's payment details are not saved.
        </p>
      </section>

      {modalOpen && (
        <div
          className="upgrade-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="upgrade-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-title"
          >
            <button
              type="button"
              className="upgrade-close"
              onClick={closeModal}
              disabled={saving}
              aria-label="Close upgrade form"
            >
              ×
            </button>

            <p className="pricing-eyebrow">DEV@DEAKIN MEMBERSHIP</p>
            <h2 id="upgrade-title">Upgrade to Paid</h2>
            <p>
              Demo price: <strong>$9.99/month</strong>
            </p>
            <p className="upgrade-disclaimer">
              Demo only. Use test values, never real payment details.
              No charge will be made.
            </p>

            <form className="upgrade-form" onSubmit={handleUpgrade}>
              <label htmlFor="cardholder">Cardholder name</label>
              <input
                id="cardholder"
                value={cardholder}
                onChange={(event) => setCardholder(event.target.value)}
                autoComplete="off"
                required
              />

              <label htmlFor="card-number">Demo card number</label>
              <input
                id="card-number"
                value={cardNumber}
                onChange={(event) =>
                  setCardNumber(
                    event.target.value.replace(/[^\d ]/g, "").slice(0, 19)
                  )
                }
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                autoComplete="off"
                required
              />

              <div className="upgrade-form-row">
                <div>
                  <label htmlFor="expiry">Expiry (MM/YY)</label>
                  <input
                    id="expiry"
                    value={expiry}
                    onChange={(event) => {
                      const digits = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);

                      setExpiry(
                        digits.length > 2
                          ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                          : digits
                      );
                    }}
                    placeholder="12/30"
                    autoComplete="off"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cvv">Demo security code</label>
                  <input
                    id="cvv"
                    value={cvv}
                    onChange={(event) =>
                      setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    inputMode="numeric"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="pricing-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="pricing-button upgrade-submit"
                type="submit"
                disabled={saving}
              >
                {saving ? "Updating plan..." : "Confirm Demo Upgrade"}
              </button>

              <button
                className="upgrade-cancel"
                type="button"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default Pricing;
