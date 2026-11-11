import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function BrowsePosts() {
    const [posts, setPosts] = useState([]);
    const [filter, setFilter] = useState("All");
    const [userPlan, setUserPlan] = useState("free");
    const [planLoading, setPlanLoading] = useState(true);

    const [hiddenPostIds, setHiddenPostIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("hiddenPostIds")) || [];
        } catch {
            return [];
        }
    });

    const [expandedPostIds, setExpandedPostIds] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setPlanLoading(true);
            setError("");

            if (!user) {
                setUserPlan("free");
                setPosts([]);
                setError("Please sign in to browse posts.");
                setPlanLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const plan = userDoc.exists() ? userDoc.data().plan : "free";
                setUserPlan(plan === "paid" ? "paid" : "free");

                const idToken = await user.getIdToken();

                const response = await fetch("http://localhost:3000/api/posts", {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Could not load posts.");
                }

                setPosts(await response.json());
            } catch (err) {
                console.error("Could not load posts:", err);
                setError("Could not load posts. Check that the backend is running and try again.");
            } finally {
                setPlanLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        localStorage.setItem("hiddenPostIds", JSON.stringify(hiddenPostIds));
    }, [hiddenPostIds]);

    const hidePost = (postId) => {
        setHiddenPostIds((current) =>
            current.includes(postId) ? current : [...current, postId]
        );
    };

    const resetHiddenPosts = () => setHiddenPostIds([]);

    const toggleExpanded = (postId) => {
        setExpandedPostIds((current) =>
            current.includes(postId)
                ? current.filter((id) => id !== postId)
                : [...current, postId]
        );
    };

    const filteredPosts = posts.filter((post) => {
        const matchesType =
            filter === "All" ||
            post.type?.toLowerCase() === filter.toLowerCase();

        return matchesType && !hiddenPostIds.includes(post.id);
    });

    if (planLoading) {
        return (
            <main className="browse-posts">
                <p>Loading posts...</p>
            </main>
        );
    }

    return (
        <main className="browse-posts">
            <h2>Browse Posts</h2>

            <p>
                Your plan:{" "}
                <strong>{userPlan === "paid" ? "Paid" : "Free"}</strong>
            </p>

            <label htmlFor="post-filter">Filter posts:</label>
            <select
                id="post-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
            >
                <option value="All">All posts</option>
                <option value="Question">Questions</option>
                <option value="Article">Articles</option>
            </select>

            <button type="button" onClick={resetHiddenPosts}>
                Reset hidden posts
            </button>

            {error && <p>{error}</p>}

            {!error && filteredPosts.length === 0 && (
                <p>No posts match this filter.</p>
            )}

            {filteredPosts.map((post) => {
                const isExpanded = expandedPostIds.includes(post.id);

                return (
                    <article key={post.id} className="post-card">
                        <h3>{post.title}</h3>
                        <p><strong>Type:</strong> {post.type}</p>

                        {post.type?.toLowerCase() === "question" && post.description && (
                            <p>{post.description}</p>
                        )}

                        {post.type?.toLowerCase() === "article" && (
                            <>
                                {post.abstract && (
                                    <p><strong>Abstract:</strong> {post.abstract}</p>
                                )}

                                {post.articleText && (
                                    <p>
                                        {isExpanded
                                            ? post.articleText
                                            : `${post.articleText.slice(0, 180)}${
                                                  post.articleText.length > 180 ? "..." : ""
                                              }`}
                                    </p>
                                )}
                            </>
                        )}

                        {post.tags?.length > 0 && (
                            <p><strong>Tags:</strong> {post.tags.join(", ")}</p>
                        )}

                        {post.createdAt && (
                            <small>
                                Posted: {new Date(post.createdAt).toLocaleString()}
                            </small>
                        )}

                        {post.type?.toLowerCase() === "article" &&
                            post.articleText?.length > 180 && (
                                <button
                                    type="button"
                                    onClick={() => toggleExpanded(post.id)}
                                >
                                    {isExpanded ? "Collapse" : "Expand"}
                                </button>
                            )}

                        <button
                            type="button"
                            onClick={() => hidePost(post.id)}
                        >
                            Hide
                        </button>
                    </article>
                );
            })}
        </main>
    );
}

export default BrowsePosts;