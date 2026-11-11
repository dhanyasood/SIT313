
require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const { initializeApp, cert } = require("firebase-admin/app");
const {
    getFirestore,
    FieldValue
} = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = require("./firebase-service-account.json");

// Initialize Firebase Admin
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const firebaseAuth = getAuth();

console.log("Firebase Admin initialized successfully");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Parse incoming JSON requests
app.use(express.json({ limit: "10kb" }));

// Check EmailJS configuration
const requiredEnv = [
    "EMAILJS_SERVICE_ID",
    "EMAILJS_TEMPLATE_ID",
    "EMAILJS_PUBLIC_KEY",
    "EMAILJS_PRIVATE_KEY"
];

const missingEnv = requiredEnv.filter(
    (key) => !process.env[key]
);

if (missingEnv.length > 0) {
    console.error(
        "Missing required environment variables:",
        missingEnv.join(", ")
    );
} else {
    console.log("EmailJS environment variables: Loaded");
}

// Health check
app.get("/health", (req, res) => {
    return res.status(200).json({
        message: "Backend is running"
    });
});

// Middleware: verify Firebase ID token
async function verifyFirebaseToken(req, res, next) {
    const authorization = req.headers.authorization;

    if (
        typeof authorization !== "string" ||
        !authorization.startsWith("Bearer ")
    ) {
        return res.status(401).json({
            message: "Authentication token is required."
        });
    }

    const idToken = authorization.slice(7).trim();

    if (!idToken) {
        return res.status(401).json({
            message: "Authentication token is required."
        });
    }

    try {
        const decodedToken = await firebaseAuth.verifyIdToken(idToken);
        req.user = decodedToken;
        return next();
    } catch (error) {
        console.error(
            "Token verification failed:",
            error.code || error.message
        );

        return res.status(401).json({
            message: "Invalid or expired authentication token."
        });
    }
}

// Protected route: return authenticated user's basic profile
app.get("/me", verifyFirebaseToken, async (req, res) => {
    try {
        const userRecord = await firebaseAuth.getUser(req.user.uid);

        return res.status(200).json({
            uid: userRecord.uid,
            email: userRecord.email || null,
            emailVerified: userRecord.emailVerified
        });
    } catch (error) {
        console.error("Unable to retrieve user:", error.message);

        return res.status(500).json({
            message: "Unable to retrieve user information."
        });
    }
});

// Protected route: read authenticated user's Firestore profile
app.get("/profile", verifyFirebaseToken, async (req, res) => {
    try {
        const userRef = db.collection("users").doc(req.user.uid);
        const userSnapshot = await userRef.get();

        if (!userSnapshot.exists) {
            return res.status(404).json({
                message: "User profile not found."
            });
        }

        const userData = userSnapshot.data();

        return res.status(200).json({
            uid: req.user.uid,
            fullName: userData.fullName || "",
            email: userData.email || req.user.email || "",
            plan: userData.plan || "Free"
        });
    } catch (error) {
        console.error("Unable to retrieve profile:", error.message);

        return res.status(500).json({
            message: "Unable to retrieve user profile."
        });
    }
});

// Protected route: upgrade the authenticated user's plan
app.post("/upgrade-plan", verifyFirebaseToken, async (req, res) => {
    try {
        const userRef = db.collection("users").doc(req.user.uid);

        // Use a transaction to avoid concurrent duplicate upgrades.
        const result = await db.runTransaction(async (transaction) => {
            const snapshot = await transaction.get(userRef);

            if (!snapshot.exists) {
                const error = new Error("User profile not found.");
                error.status = 404;
                throw error;
            }

            if (snapshot.data().plan === "Paid") {
                const error = new Error(
                    "Your account is already on the Paid plan."
                );
                error.status = 409;
                throw error;
            }

            transaction.update(userRef, {
                plan: "Paid",
                planUpdatedAt: FieldValue.serverTimestamp()
            });

            return {
                message: "Your account has been upgraded to the Paid plan.",
                plan: "Paid"
            };
        });

        return res.status(200).json(result);
    } catch (error) {
        if (error.status === 404 || error.status === 409) {
            return res.status(error.status).json({
                message: error.message
            });
        }

        console.error("Plan upgrade failed:", error.message);

        return res.status(500).json({
            message: "Unable to upgrade your plan. Please try again."
        });
    }
});

// Newsletter subscription endpoint
app.post("/subscribe", async (req, res) => {
    const email =
        typeof req.body?.email === "string"
            ? req.body.email.trim()
            : "";

    if (!email) {
        return res.status(400).json({
            message: "Email address is required."
        });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return res.status(400).json({
            message: "Please enter a valid email address."
        });
    }

    if (missingEnv.length > 0) {
        return res.status(500).json({
            message: "Email service is not configured."
        });
    }

    try {
        const response = await fetch(
            "https://api.emailjs.com/api/v1.0/email/send",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    service_id: process.env.EMAILJS_SERVICE_ID,
                    template_id: process.env.EMAILJS_TEMPLATE_ID,
                    user_id: process.env.EMAILJS_PUBLIC_KEY,
                    accessToken: process.env.EMAILJS_PRIVATE_KEY,
                    template_params: {
                        email
                    }
                })
            }
        );

        console.log("EmailJS HTTP status:", response.status);

        // Do not log the provider's response body.
        if (!response.ok) {
            return res.status(502).json({
                message: "Email could not be sent. Please try again."
            });
        }

        return res.status(200).json({
            message: "Subscription successful! Welcome email sent."
        });
    } catch (error) {
        console.error("EmailJS request failed:", error.message);

        return res.status(500).json({
            message: "Something went wrong. Please try again."
        });
    }
});

// Handle malformed JSON and request errors
app.use((error, req, res, next) => {
    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        "body" in error
    ) {
        return res.status(400).json({
            message: "Invalid JSON request body."
        });
    }

    if (error.type === "entity.too.large") {
        return res.status(413).json({
            message: "Request body is too large."
        });
    }

    return next(error);
});

// Generic error handler
app.use((error, req, res, next) => {
    console.error("Unexpected server error:", error.message);

    if (res.headersSent) {
        return next(error);
    }

    return res.status(500).json({
        message: "Internal server error."
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
