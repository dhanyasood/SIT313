
require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");

const app = express();
const PORT = 3000;

// Middleware: parse incoming JSON requests
app.use(express.json());

// Check that required environment variables are configured
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

// Newsletter subscription endpoint
app.post("/subscribe", async (req, res) => {
    // Validate and normalize the email
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

    // Do not call EmailJS if configuration is incomplete
    if (missingEnv.length > 0) {
        return res.status(500).json({
            message: "Email service is not configured."
        });
    }

    try {
        // Send the email through the EmailJS REST API
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
                        email: email
                    }
                })
            }
        );

        // Read and log the actual EmailJS response
        const result = await response.text();

        console.log("EmailJS HTTP status:", response.status);
        console.log("EmailJS response:", result);

        // Handle unsuccessful EmailJS responses
        if (!response.ok) {
            return res.status(502).json({
                message: "Email could not be sent. Please try again."
            });
        }

        // Notify the frontend of success
        return res.status(200).json({
            message: "Subscription successful! Welcome email sent."
        });

    } catch (error) {
        // Handle network errors or unexpected failures
        console.error("EmailJS request failed:", error.message);

        return res.status(500).json({
            message: "Something went wrong. Please try again."
        });
    }
});

// Handle malformed JSON requests
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400) {
        return res.status(400).json({
            message: "Invalid JSON request body."
        });
    }

    return next(error);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
