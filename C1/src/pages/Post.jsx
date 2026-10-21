
import { useState } from "react";
import "./Post.css";

function NewPost() {
    const [postType, setPostType] = useState("Question");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [abstract, setAbstract] = useState("");
    const [articleText, setArticleText] = useState("");
    const [tags, setTags] = useState("");

    function handlePost(event) {
        event.preventDefault();

        if (title.trim() === "") {
            alert("Please enter a title.");
            return;
        }

        if (
            postType === "Question" &&
            description.trim() === ""
        ) {
            alert("Please describe your problem.");
            return;
        }

        if (
            postType === "Article" &&
            abstract.trim() === ""
        ) {
            alert("Please enter an abstract.");
            return;
        }

        if (
            postType === "Article" &&
            articleText.trim() === ""
        ) {
            alert("Please enter your article text.");
            return;
        }

        const tagList = tags
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag !== "");

        if (tagList.length > 3) {
            alert("You can add a maximum of 3 tags.");
            return;
        }

        alert("Your post has been submitted successfully!");
    }

    return (
        <div className="new-post">
            <h2>New Post</h2>

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

            <h3>What do you want to ask or share?</h3>
            <p className="post-instructions">
    This section changes depending on the type of post you select.
    Please complete the required fields before clicking Post.
</p>

            <form onSubmit={handlePost} noValidate>
                <label htmlFor="title">Title</label>

                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                        setTitle(event.target.value)
                    }
                    placeholder={
                        postType === "Question"
                            ? "Start your question with how, what, why, etc."
                            : "Enter a descriptive title"
                    }
                />

                {postType === "Question" ? (
                    <>
                        <label htmlFor="description">
                            Describe your problem
                        </label>

                        <textarea
                            id="description"
                            rows="8"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            placeholder="Describe your problem..."
                        />
                    </>
                ) : (
                    <>
                        <label htmlFor="abstract">
                            Abstract
                        </label>

                        <textarea
                            id="abstract"
                            rows="3"
                            value={abstract}
                            onChange={(event) =>
                                setAbstract(event.target.value)
                            }
                            placeholder="Enter a 1-paragraph abstract"
                        />

                        <label htmlFor="articleText">
                            Article Text
                        </label>

                        <textarea
                            id="articleText"
                            rows="8"
                            value={articleText}
                            onChange={(event) =>
                                setArticleText(event.target.value)
                            }
                            placeholder="Enter your article text..."
                        />
                    </>
                )}

                <label htmlFor="tags">Tags</label>

                <input
                    id="tags"
                    type="text"
                    value={tags}
                    onChange={(event) =>
                        setTags(event.target.value)
                    }
                    placeholder="Add up to 3 tags, e.g. Java, React"
                />

                <button type="submit">Post</button>
            </form>
        </div>
    );
}

export default NewPost;
