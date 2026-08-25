import React from 'react';
import './Aboutus.css';

// 1. Import your images from the assets folder here
import shinnPic from '../assets/photo_2026-08-08_14-52-47.jpg';
import kentPic from '../assets/photo_2026-06-16_23-06-37.jpg';

export default function Aboutus() {
    return (
        <div className="about-us-container">
            
            {/* Main Introduction */}
            <div className="about-intro">
                <h3>About Us</h3>
                <p>
                    We are a team of Computer Science students who came together to create this Timetable Scheduler. 
                    Our goal is to make the complex process of educational scheduling faster, easier, and much more efficient for schools and universities.
                </p>
            </div>

            {/* Row 1: Shinn Thant (Text on Left, Image on Right) */}
            <div className="team-row">
                <div className="team-text">
                    <h4>Shinn Thant</h4>
                    <h5>II SE-2</h5>
                    <span className="role-badge">Backend & Database</span>
                    <p>
                        Shinn Thant is the backbone of this project, taking charge of the backend architecture and database management. He ensures that all data is stored systematically and securely, while working behind the scenes to make sure the entire system runs quickly and smoothly.
                    </p>
                </div>
                <div className="team-image">
                    {/* 2. Use the imported variable here */}
                    <img src={shinnPic} alt="Shinn Thant" className="profile-pic" />
                </div>
            </div>

            {/* Row 2: Kent Linn Naung (Image on Left, Text on Right) */}
            <div className="team-row">
                <div className="team-image">
                    {/* 2. Use the imported variable here */}
                    <img src={kentPic} alt="Kent Linn Naung" className="profile-pic" />
                </div>
                <div className="team-text">
                    <h4>Kent Linn Naung</h4>
                    <h5>II SE-8</h5>
                    <span className="role-badge">Frontend & Design</span>
                    <p>
                        Kent Linn Naung leads the frontend development and UI/UX design, focusing on creating a seamless experience for users. He is dedicated to building an interface that is not only highly intuitive and easy to navigate but also visually engaging.
                    </p>
                </div>
            </div>

        </div>
    );
}