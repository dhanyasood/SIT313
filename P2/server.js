require("dotenv").config();

const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static(__dirname));

app.post("/subscribe", async (req, res) => {
    const email = req.body.email;

    if (!email) {
        return res.status(400).json({
            message: "Email address is required."
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
                        email: email
                    }
                })
            }
        );

        const result = await response.text();

        console.log("EmailJS status:", response.status);
        console.log("EmailJS response:", result);

        if (!response.ok) {
            return res.status(500).json({
                message: "Email could not be sent."
            });
        }

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});