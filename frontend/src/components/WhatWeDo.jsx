import React from 'react';
import './WhatWeDo.css';

export default function WhatWeDo() {
    return (
        <div className="what-we-do-container">
            <h3>What We Do</h3>
            
            <p className="what-intro">
                <strong>Intelliclass</strong> is a full-stack web application designed to completely automate and optimize university course scheduling. Built with a modern React frontend, a robust Java backend, and an SQL database, our platform eliminates the headache of manual scheduling.
            </p>

            <div className="steps-container">
                {/* Step 1 */}
                <div className="step-box">
                    <div className="step-number">1</div>
                    <h4>Configure Data</h4>
                    <p>Input your university's foundational data into our secure system. Easily manage teacher profiles, departments, campus rooms, and curriculum subjects through our intuitive dashboard.</p>
                </div>

                {/* Step 2 */}
                <div className="step-box">
                    <div className="step-number">2</div>
                    <h4>Set Constraints</h4>
                    <p>Define your class sessions and target groups. The system allows you to easily flag unavailable teachers or specific requirements before the optimization engine runs.</p>
                </div>

                {/* Step 3 */}
                <div className="step-box">
                    <div className="step-number">3</div>
                    <h4>Generate Schedule</h4>
                    <p>With a single click, our Java backend triggers the Timefold AI engine. It instantly calculates millions of possibilities to deliver a perfect, conflict-free weekly timetable.</p>
                </div>
            </div>
            
        </div>
    );
}