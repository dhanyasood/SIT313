function ArticleCard({ title, description, image }) {
    return (
        <article className="article-card">
            <img src={image} alt={title} />
            <h3>{title}</h3>
            <p>{description}</p>
            <button>Read More</button>
        </article>
    );
}

export default ArticleCard;