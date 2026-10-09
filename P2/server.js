require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Check environment variables
console.log("Service ID:", process.env.EMAILJS_SERVICE_ID ? "Loaded" : "Missing");
console.log("Template ID:", process.env.EMAILJS_TEMPLATE_ID ? "Loaded" : "Missing");
console.log("Public Key:", process.env.EMAILJS_PUBLIC_KEY ? "Loaded" : "Missing");
console.log("Private Key:", process.env.EMAILJS_PRIVATE_KEY ? "Loaded" : "Missing");

// Subscribe route
app.post("/subscribe", async (req, res) => {
    const email = req.body.email;

    // Check email
    if (!email) {
        return res.status(400).json({
            message: "Email address is required."
        });
    }

    try {
        // Send email using EmailJS REST API
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

        // Get EmailJS response
        const result = await response.text();

        console.log("EmailJS status:", response.status);
        console.log("EmailJS response:", result);

        // If EmailJS failed
        if (!response.ok) {
            return res.status(500).json({
                message: "Email could not be sent."
            });
        }

        // Success
        res.status(200).json({
            message: "Subscription successful! Welcome email sent."
        });

    } catch (error) {
        console.error("EmailJS error:", error);

        res.status(500).json({
            message: "Something went wrong. Please try again."
        });
    }
});
console.log(process.env.EMAILJS_PRIVATE_KEY);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});