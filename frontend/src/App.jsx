// src/App.jsx
import { useState } from 'react';
import Layout from './components/Layout';
import Home from './Home'; // <-- 1. Import your new Home component here
import TeacherList from './TeacherList';
import TeacherRegistration from './TeacherRegistration';
import TeacherEditForm from './TeacherEditForm';
import University from './UniversityMain';
import Timetable from './TimeTableMain';

function App() {
    const [activePage, setActivePage] = useState('home');
    const [editingTeacherId, setEditingTeacherId] = useState(null);

    const [isFocusMode, setIsFocusMode] = useState(false);
    const [isDockOpen, setIsDockOpen] = useState(false);

    const renderContent = () => {
        switch(activePage) {
            case 'home':
                return <Home />; // <-- 2. Render Home here
            case 'teacher':
                return <TeacherList
                    onAddClick={() => setActivePage('add-teacher')}
                    onEditClick={(id) => {
                        setEditingTeacherId(id);
                        setActivePage('edit-teacher');
                    }}
                />;
            case 'add-teacher':
                return (
                    <div>
                        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setActivePage('teacher')}
                                style={{marginBottom: '16px', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'}}
                            >
                                ← Back
                            </button>
                        </div>
                        <TeacherRegistration onComplete={() => setActivePage('teacher')} />
                    </div>
                );
            case 'edit-teacher':
                return (
                    <TeacherEditForm
                        teacherId={editingTeacherId}
                        onComplete={() => setActivePage('teacher')}
                        onCancel={() => setActivePage('teacher')}
                    />
                );
            case 'university':
                return <University />;
            case 'timetable':
                return <Timetable
                    isDockOpen={isDockOpen}
                    setIsDockOpen={setIsDockOpen}
                    setIsFocusMode={setIsFocusMode}
                />;
            default:
                return <Home />; // <-- 3. Render Home here as default too
        }
    };

    return (
        <Layout
            activePage={activePage}
            setActivePage={setActivePage}
            username="Shinn Thant"
            onLogout={() => console.log("Logging out...")}
            isFocusMode={isFocusMode}
            setIsFocusMode={setIsFocusMode}
        >
            {renderContent()}
        </Layout>
    );
}

export default App;