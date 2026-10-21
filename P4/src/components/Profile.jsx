import profile from "../assets/profile.png";
function Profile() {
    return (
        <section id="about" className="profile">
            <div className="profile-content">
                <div>
                    <h2>About Me</h2>
                    <img src={profile} alt="Dhanya Sood profile" />
                    <h3>Dhanya Sood</h3>

                    <p>
                        I am a Software Engineering student interested in
                        software development, web technologies and learning
                        new skills.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default Profile;