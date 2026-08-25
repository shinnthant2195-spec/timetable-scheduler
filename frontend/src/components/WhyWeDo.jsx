import React from 'react';
import './WhyWeDo.css';

export default function WhyWeDo() {
    return (
        <div className="why-we-do-container">
            {/* Centered Title */}
            <h3 className="why-we-do-title">Why We Do It</h3>
            
            {/* 2-Column Layout */}
            <div className="why-columns">
                
                {/* Left Column: The Problem & Solution */}
                <div className="why-column">
                    <p>
                        We are a dedicated team of developers passionate about using technology to solve real-world problems. We recognized that creating timetables manually is a complex and time-consuming challenge for schools, universities, and educational institutions.
                    </p>
                    <p>
                        To address this, we built the Timetable Scheduler system. Our platform is designed to automate the scheduling process, efficiently allocate teachers and classrooms, and eliminate human error.
                    </p>
                </div>

                {/* Right Column: The Benefits (with bullets) & Mission */}
                <div className="why-column">
                    <p>By leveraging advanced technology, we ensure that both students and educators receive a smooth and well-organized schedule. Our system provides:</p>
                    
                    <ul>
                        <li>Automated, conflict-free scheduling</li>
                        <li>Efficient allocation of classrooms and resources</li>
                        <li>A massive reduction in administrative burdens</li>
                    </ul>
                    
                    <p>
                        Our main mission is to help educational institutions focus more on teaching and learning. We are continuously working to improve our platform, and we thank you for trusting our system.
                    </p>
                </div>

            </div>
        </div>
    );
}