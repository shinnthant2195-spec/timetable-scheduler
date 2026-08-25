// src/components/Layout.jsx
import React from 'react';
import './Layout.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHouse,
    faChalkboardUser,
    faSchool,
    faCalendar,
    faBell,
    faMessage,
    faMaximize,
    faMinimize
} from '@fortawesome/free-solid-svg-icons';

import profileImage from '../assets/photo_2026-08-08_14-52-47.jpg';
import logoImage from "../assets/nspu logo.png";

function Layout({ activePage, setActivePage, children, onLogout, username = "Guest User", isFocusMode, setIsFocusMode }) {
    
    return (
        <div className="layout-container">
            {/* Sidebar - Added dynamic collapsed class */}
            <aside className={`sidebar ${isFocusMode ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <h2 className="full-logo">INTELLICLASS</h2>
                    <h2 className="mini-logo">IC</h2>
                </div>
                <div className="sidebar-nav">
                    <nav>
                        <ul className="item-list">
                            <li
                                className={activePage === "home" ? "active" : ""}
                                onClick={() => setActivePage("home")}
                            >
                                <FontAwesomeIcon icon={faHouse} />
                                <span className="nav-text">Home</span>
                            </li>
                            <li
                                className={activePage === "teacher" ? "active" : ""}
                                onClick={() => setActivePage("teacher")}
                            >
                                <FontAwesomeIcon icon={faChalkboardUser} />
                                <span className="nav-text">Teacher</span>
                            </li>
                            <li
                                className={activePage === "university" ? "active" : ""}
                                onClick={() => setActivePage("university")}
                            >
                                <FontAwesomeIcon icon={faSchool} />
                                <span className="nav-text">University</span>
                            </li>
                            <li
                                className={activePage === "timetable" ? "active" : ""}
                                onClick={() => setActivePage("timetable")}
                            >
                                <FontAwesomeIcon icon={faCalendar} />
                                <span className="nav-text">Time Table</span>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="sidebar-footer">
                    {/* Focus Mode Toggle Only */}
                    <button className="members-btn focus-btn" onClick={() => setIsFocusMode(!isFocusMode)}>
                        <FontAwesomeIcon icon={isFocusMode ? faMinimize : faMaximize} className="btn-icon" />
                        <span className="nav-text">Focus Mode</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {/* Topbar - Added dynamic hidden class */}
                <header className={`topbar ${isFocusMode ? 'hidden' : ''}`}>
                    <img className='nspu-logo' alt="NSPU_Logo" src={logoImage}></img>

                    <div className="topbar-right">
                        <div className="action-icons">
                            <button className="icon-btn" title="Notifications">
                                <FontAwesomeIcon icon={faBell} />
                            </button>
                            <button className="icon-btn" title="Messages">
                                <FontAwesomeIcon icon={faMessage} />
                            </button>
                        </div>
                        <div className="user-profile" onClick={onLogout}>
                            <img
                                src={profileImage}
                                alt="User Profile"
                                className="profile-avatar"
                            />
                            <div className="profile-info">
                                <span className="profile-name">{username}</span>
                                <span className="profile-role">Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamically Rendered Page Content */}
                <div className={`page-content ${isFocusMode ? 'focused' : ''}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}

export default Layout;