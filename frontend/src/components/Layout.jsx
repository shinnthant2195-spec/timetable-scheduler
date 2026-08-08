
// src/components/Layout.jsx
import './Layout.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHouse, 
  faChalkboardUser, 
  faSchool,
  faCalendar,
  faBell,
  faMessage
} from '@fortawesome/free-solid-svg-icons';

// Add this line to import your image:
import profileImage from '../assets/photo_2026-08-08_14-52-47.jpg';

function Layout({ activePage, setActivePage, children, onLogout, username = "Guest User" }) {
    
    return (
        <div className="layout-container">

            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>INTELLICLASS</h2>
                </div>

                <div className="sidebar-nav">
                    <nav>
                        <ul className="item-list">
                            <li
                                className={activePage === "home" ? "active" : ""}
                                onClick={() => setActivePage("home")}
                            >
                                <FontAwesomeIcon icon={faHouse} />
                                <span>Home</span>
                            </li>

                            <li
                                className={activePage === "teacher" ? "active" : ""}
                                onClick={() => setActivePage("teacher")}
                            >
                                <FontAwesomeIcon icon={faChalkboardUser} />
                                <span>Teacher</span>
                            </li>

                            <li
                                className={activePage === "university" ? "active" : ""}
                                onClick={() => setActivePage("university")}
                            >
                                <FontAwesomeIcon icon={faSchool} />
                                <span>University</span>
                            </li>

                            <li
                                className={activePage === "timetable" ? "active" : ""}
                                onClick={() => setActivePage("timetable")}
                            >
                                <FontAwesomeIcon icon={faCalendar} />
                                <span>Time Table</span>
                            </li>
                        </ul>
                    </nav>
                </div>
            </aside>
            
            {/* Main Content Window */}
            <main className="main-content">
                <header className="topbar">
                    
                    {/* Delete Search Bar Here*/}
                    
                    {/* Topbar Right Controls */}
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
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default Layout;