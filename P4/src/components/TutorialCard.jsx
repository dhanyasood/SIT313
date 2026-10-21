function TutorialCard({ title, description, image, rating, username }) {
    return (
        <article className="tutorial-card">

            <img src={image} alt={title} />

            <h3>{title}</h3>

            <p>{description}</p>

            <div className="rating">
                ⭐ {rating}
            </div>

            <div className="author">
                By {username}
            </div>

            <button>View Tutorial</button>

        </article>
    );
}

export default TutorialCard;