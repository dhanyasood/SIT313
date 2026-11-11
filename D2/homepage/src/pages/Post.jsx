import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Post.css";

function NewPost() {
    const [user, setUser] = useState(null);
    const [userPlan, setUserPlan] = useState("free");
    const [planLoading, setPlanLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [postType, setPostType] = useState("Question");
    const [postPlan, setPostPlan] = useState("free");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [abstract, setAbstract] = useState("");
    const [articleText, setArticleText] = useState("");
    const [tags, setTags] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setPlanLoading(true);

            if (!currentUser) {
                setUserPlan("free");
                setPostPlan("free");
                setPlanLoading(false);
                return;
            }

            try {
                const userSnapshot = await getDoc(doc(db, "users", currentUser.uid));
                const plan =
                    userSnapshot.exists() && userSnapshot.data().plan === "paid"
                        ? "paid"
                        : "free";

                setUserPlan(plan);
                if (plan === "free") setPostPlan("free");
            } catch (error) {
                console.error("Could not load user plan:", error);
                setUserPlan("free");
                setPostPlan("free");
            } finally {
                setPlanLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    async function handlePost(event) {
        event.preventDefault();

        if (!user) {
            alert("Please log in before creating a post.");
            return;
        }

        if (planLoading || submitting) return;

        if (postPlan === "paid" && userPlan !== "paid") {
            alert("Upgrade to the Paid plan to create Paid posts.");
            return;
        }

        if (!title.trim()) {
            alert("Please enter a title.");
            return;
        }

        if (postType === "Question" && !description.trim()) {
            alert("Please describe your problem.");
            return;
        }

        if (postType === "Article" && !abstract.trim()) {
            alert("Please enter an abstract.");
            return;
        }

        if (postType === "Article" && !articleText.trim()) {
            alert("Please enter your article text.");
            return;
        }

        const tagList = tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);

        if (tagList.length > 3) {
            alert("You can add a maximum of 3 tags.");
            return;
        }

        setSubmitting(true);

        try {
            const idToken = await user.getIdToken();

            const response = await fetch("http://localhost:3000/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    type: postType,
                    title: title.trim(),
                    description: description.trim(),
                    abstract: abstract.trim(),
                    articleText: articleText.trim(),
                    content:
                        postType === "Question"
                            ? description.trim()
                            : articleText.trim(),
                    tags: tagList,
                    plan: postPlan,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || "Could not save post.");
            }

            alert("Your post has been saved successfully!");

            setTitle("");
            setDescription("");
            setAbstract("");
            setArticleText("");
            setTags("");
            setPostType("Question");
            setPostPlan("free");
        } catch (error) {
            console.error("Post submission failed:", error);
            alert(error.message || "Could not save post. Check that the backend is running.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="new-post">
            <h2>New Post</h2>

            <p>
                Your account plan:{" "}
                <strong>
                    {planLoading ? "Loading..." : userPlan === "paid" ? "Paid" : "Free"}
                </strong>
            </p>

            <div className="post-type">
                <p>Select Post Type:</p>

                <label>
                    <input
                        type="radio"
                        name="postType"
                        value="Question"
                        checked={postType === "Question"}
                        onChange={() => setPostType("Question")}
                    />
                    Question
                </label>

                <label>
                    <input
                        type="radio"
                        name="postType"
                        value="Article"
                        checked={postType === "Article"}
                        onChange={() => setPostType("Article")}
                    />
                    Article
                </label>
            </div>

            <label htmlFor="postPlan">Post access</label>
            <select
                id="postPlan"
                value={postPlan}
                onChange={(event) => setPostPlan(event.target.value)}
                disabled={planLoading || userPlan !== "paid"}
            >
                <option value="free">Free — available to everyone</option>
                {userPlan === "paid" && (
                    <option value="paid">Paid — available to Paid members</option>
                )}
            </select>

            {userPlan !== "paid" && (
                <p>
                    Free accounts can create Free posts. Upgrade your account to
                    create Paid posts.
                </p>
            )}

            <h3>What do you want to ask or share?</h3>
            <p className="post-instructions">
                Complete the required fields before clicking Post.
            </p>

            <form onSubmit={handlePost} noValidate>
                <label htmlFor="title">Title</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={
                        postType === "Question"
                            ? "Start your question with how, what, why, etc."
                            : "Enter a descriptive title"
                    }
                />

                {postType === "Question" ? (
                    <>
                        <label htmlFor="description">Describe your problem</label>
                        <textarea
                            id="description"
                            rows="8"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Describe your problem..."
                        />
                    </>
                ) : (
                    <>
                        <label htmlFor="abstract">Abstract</label>
                        <textarea
                            id="abstract"
                            rows="3"
                            value={abstract}
                            onChange={(event) => setAbstract(event.target.value)}
                            placeholder="Enter a 1-paragraph abstract"
                        />

                        <label htmlFor="articleText">Article Text</label>
                        <textarea
                            id="articleText"
                            rows="8"
                            value={articleText}
                            onChange={(event) => setArticleText(event.target.value)}
                            placeholder="Enter your article text..."
                        />
                    </>
                )}

                <label htmlFor="tags">Tags</label>
                <input
                    id="tags"
                    type="text"
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="Add up to 3 tags, e.g. Java, React"
                />

                <button type="submit" disabled={planLoading || submitting}>
                    {submitting ? "Posting..." : "Post"}
                </button>
            </form>
        </div>
    );
}

export default NewPost;