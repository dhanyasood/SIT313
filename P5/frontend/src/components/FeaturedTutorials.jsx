import TutorialCard from "./TutorialCard";
import tutorial1 from "../assets/tutorial1.png";
import tutorial2 from "../assets/tutorial2.png";
import tutorial3 from "../assets/tutorial3.png";
function FeaturedTutorials() {

    const tutorials = [
        {
            title: "Introduction to HTML",
            description: "Learn the basic structure of a web page.",
            image: tutorial1,
            username: "John Doe",
            rating: 4.5
        },
        {
            title: "Introduction to CSS",
            description: "Learn how CSS is used to style web pages.",
            image: tutorial2,
            username: "Jane Smith",
            rating: 4.7
        },
        {
            title: "Getting Started with React",
            description: "Learn the fundamentals of React components.",
            image: tutorial3,
            username: "Alice Johnson",
            rating: 4.8
        }
    ];

    return (
        <section className="featured-tutorials">
            <h2>Featured Tutorials</h2>

            <div className="tutorial-list">
                {tutorials.map((tutorial) => (
                    <TutorialCard
                        key={tutorial.title}
                        title={tutorial.title}
                        description={tutorial.description}
                        image={tutorial.image}
                        username={tutorial.username}
                        rating={tutorial.rating}
                    />
                ))}
            </div>
        </section>
    );
}

export default FeaturedTutorials;