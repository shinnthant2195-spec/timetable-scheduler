import React, { useState } from 'react';
import './components/ConstraintExplanation.css'; 
import './Home.css';

import WhatWeDo from './components/WhatWeDo';
import WhyWeDo from './components/WhyWeDo';

// 1. Import your ConstraintExplanation component
import ConstraintExplanation from './components/ConstraintExplanation';

// Add this import:
import Aboutus from './components/Aboutus';

export default function Home() {
    // State to track which tab is currently open
    const [activeTab, setActiveTab] = useState('what');

    return(
        <div className="explanation-container">
            {/* Hero Section */}
            <div className="hero-layout">
                <div className="hero-left">
                    <h1>Intelliclass</h1>
                    <h2>TimeTable Scheduler</h2>
                    <h3>--Master Your Time!--</h3>
                </div>
                
                <div className="explanation-hero right-box">
                    <p>
                        Leveraging Timefold AI, the system automatically generates conflict-free timetables by optimally balancing the requirements of faculty, students, and classroom facilities
                    </p>
                </div>
            </div>

            {/* --- MINI SUB TABS --- */}
            <div className="home-tabs">
                <button className={activeTab === 'what' ? 'active' : ''} onClick={() => setActiveTab('what')}>What We Do</button>
                <button className={activeTab === 'how' ? 'active' : ''} onClick={() => setActiveTab('how')}>How We Do</button>
                <button className={activeTab === 'why' ? 'active' : ''} onClick={() => setActiveTab('why')}>Why We Do</button>
                <button className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>About Us</button>
            </div>

            {/* Tab Content Area */}
            <div className="home-tab-content">
                {activeTab === 'what' && (
                    <div className="tab-pane">
                        <WhatWeDo />
                    </div>
                )}
                
                {activeTab === 'how' && (
                    <div className="tab-pane">
                        <h3 style={{ marginBottom: '16px' }}>How We Do It</h3>
                        <p style={{ marginBottom: '32px' }}>Our algorithm balances multiple variables simultaneously. It rigorously enforces hard constraints—like preventing instructor overlaps and room double-bookings—while intelligently optimizing soft constraints, such as balancing workloads and ensuring optimal student break times.</p>
                        
                        {/* 2. Simply render the component here! */}
                        <ConstraintExplanation />
                        
                    </div>
                )}

                {activeTab === 'why' && (
                    <div className="tab-pane">
                        <WhyWeDo />
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="tab-pane">
                        <Aboutus />
                    </div>
                )}
            </div>
        </div>
    );
}