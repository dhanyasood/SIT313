import ArticleCard from "./ArticleCard";
import article1 from "../assets/article1.png";
import article2 from "../assets/article2.png";
import article3 from "../assets/article3.png";

function FeaturedArticles() {

    const articles = [
        {
            title: "Getting Started with Web Development",
            description: "Learn the fundamentals of creating modern websites.",
            image: article1
        },
        {
            title: "Understanding Software Engineering",
            description: "Explore important concepts used in software engineering.",
            image: article2 
        },
        {
            title: "Building Projects with React",
            description: "Learn how React components can be used to build interfaces.",
            image: article3
        }
    ];

    return (
        <section className="featured-articles">
            <h2>Featured Articles</h2>

            <div className="article-list">
                {articles.map((article) => (
                    <ArticleCard
                        key={article.title}
                        title={article.title}
                        description={article.description}
                        image={article.image}
                    />
                ))}
            </div>
        </section>
    );
}

export default FeaturedArticles;