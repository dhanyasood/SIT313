
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      alert("Unable to log out. Please try again.");
    }
  }

  return (
    <header className="site-header">
      <Link to="/" className="site-logo">
        DEV@Deakin
      </Link>

      <div className="header-search">
        <input
          type="search"
          placeholder="Search..."
          aria-label="Search"
        />
        <button type="button">Search</button>
      </div>

      <nav className="header-nav">
        <a href="/#about">About</a>
        <a href="/#work">Work</a>
        <a href="/#contact">Contact</a>

        <button type="button">Post</button>

        {user ? (
          <>
            <span className="header-user">
              Hi, {user.displayName || user.email}
            </span>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
