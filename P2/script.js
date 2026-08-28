const form = document.getElementById("newsletterform");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;

    try {
        const response = await fetch("/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        message.textContent = data.message;
    } catch (error) {
        message.textContent = "Something went wrong. Please try again.";
        console.error(error);
    }
});