import ProjectCard from "./projectcard";
import project1 from "../assets/airbnb.png";
import project2 from "../assets/shespends.png";
import project3 from "../assets/arduino.png";

function Projects() {

    const projects = [
        {
            title: "Airbnb Inspired Property Booking Platform",
            description: "A property booking platform project.",
            image: project1
        },
        {
            title: "SheSpends",
            description: "A personal finance project.",
            image: project2
        },
        {
            title: "Arduino Anti-Distraction Desk Assistant",
            description: "An embedded systems project using Arduino.",
            image: project3
        }
    ];

    return (
        <section id="work" className="projects">
            <h2>My Projects</h2>

            <div className="project-list">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.title}
                        title={project.title}
                        description={project.description}
                        image={project.image}
                    />
                ))}
            </div>
        </section>
    );
}

export default Projects;