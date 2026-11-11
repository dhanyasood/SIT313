import express from "express";
import cors from "cors";
import { db, auth } from "./firebaseAdmin.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function getAuthenticatedUser(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Authentication required.");
    }

    const idToken = authHeader.split(" ")[1];
    return auth.verifyIdToken(idToken);
}

// Create a post.
// Free users can create Questions.
// Only Paid users can create Articles or Paid posts.
app.post("/api/posts", async (req, res) => {
    try {
        const decodedToken = await getAuthenticatedUser(req);

        const userDoc = await db
            .collection("users")
            .doc(decodedToken.uid)
            .get();

        const userPlan = userDoc.exists
            ? userDoc.data().plan || "free"
            : "free";

        const {
            type,
            title,
            description = "",
            abstract = "",
            articleText = "",
            content = "",
            tags = [],
            plan = "free",
        } = req.body;

        if (!["Question", "Article"].includes(type)) {
            return res.status(400).json({
                error: "Invalid post type. Choose Question or Article.",
            });
        }

        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                error: "Title is required.",
            });
        }

        if (type === "Question" &&
            (typeof description !== "string" || !description.trim())) {
            return res.status(400).json({
                error: "Question description is required.",
            });
        }

        if (
            type === "Article" &&
            (
                typeof abstract !== "string" ||
                !abstract.trim() ||
                typeof articleText !== "string" ||
                !articleText.trim()
            )
        ) {
            return res.status(400).json({
                error: "Article abstract and text are required.",
            });
        }

        if (!["free", "paid"].includes(plan)) {
            return res.status(400).json({
                error: "Invalid post plan.",
            });
        }

        // IMPORTANT: Articles are Paid-only.
        // This check uses the user's Firestore plan, not req.body.plan.
        if (type === "Article" && userPlan !== "paid") {
            return res.status(403).json({
                error: "Upgrade to the Paid plan to create Articles.",
            });
        }

        // Paid posts are also restricted to Paid users.
        if (plan === "paid" && userPlan !== "paid") {
            return res.status(403).json({
                error: "Upgrade to the Paid plan to create Paid posts.",
            });
        }

        const postData = {
            type,
            title: title.trim(),
            description: description.trim(),
            abstract: abstract.trim(),
            articleText: articleText.trim(),
            content:
                content ||
                (type === "Question" ? description : articleText),
            tags: Array.isArray(tags)
                ? tags
                    .filter((tag) => typeof tag === "string")
                    .slice(0, 3)
                : [],
            plan,
            authorId: decodedToken.uid,
            createdAt: new Date().toISOString(),
        };

        const postRef = await db.collection("posts").add(postData);

        return res.status(201).json({
            message: "Post created successfully.",
            post: {
                id: postRef.id,
                ...postData,
            },
        });
    } catch (error) {
        console.error("Error creating post:", error);

        return res.status(401).json({
            error: error.message || "Could not create post.",
        });
    }
});

// Return posts the authenticated user's plan can access.
app.get("/api/posts", async (req, res) => {
    try {
        const decodedToken = await getAuthenticatedUser(req);

        const userDoc = await db
            .collection("users")
            .doc(decodedToken.uid)
            .get();

        const userPlan = userDoc.exists
            ? userDoc.data().plan || "free"
            : "free";

        const snapshot = await db.collection("posts").get();

        const posts = snapshot.docs
            .map((postDoc) => ({
                id: postDoc.id,
                ...postDoc.data(),
            }))
            .filter(
                (post) => userPlan === "paid" || post.plan !== "paid"
            );

        return res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);

        return res.status(401).json({
            error: error.message || "Could not fetch posts.",
        });
    }
});

// Demo upgrade endpoint. This changes the plan only; it does not process payment.
app.post("/upgrade-plan", async (req, res) => {
    try {
        const decodedToken = await getAuthenticatedUser(req);

        if (req.body.plan !== "paid") {
            return res.status(400).json({
                error: "Invalid plan. Only the paid plan can be selected.",
            });
        }

        await db.collection("users").doc(decodedToken.uid).set(
            { plan: "paid" },
            { merge: true }
        );

        return res.json({
            message: "Plan updated successfully.",
            plan: "paid",
        });
    } catch (error) {
        console.error("Error upgrading plan:", error);

        return res.status(401).json({
            error: error.message || "Could not upgrade plan.",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});