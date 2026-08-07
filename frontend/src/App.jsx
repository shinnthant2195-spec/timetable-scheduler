import { useState } from 'react';
import Layout from './components/Layout';
import ConstraintExplanation from './components/ConstraintExplanation'; // Added new import
import TeacherList from './TeacherList';
import TeacherRegistration from './TeacherRegistration'; 
import TeacherEditForm from './TeacherEditForm'; 
import University from './UniversityMain'; 
import Timetable from './TimeTableMain'; 

function App() {
  const [activePage, setActivePage] = useState('home');
  const [editingTeacherId, setEditingTeacherId] = useState(null); 

  const renderContent = () => {
    switch(activePage) {
      case 'home':
        // Replaced the blank welcome message with the new Burmese explanation page
        return <ConstraintExplanation />; 
        
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
                <button onClick={() => setActivePage('teacher')} style={{marginBottom: '16px', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>← Back to Teachers</button>
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
        return <Timetable />;
        
      default:
        // Set default to also render the explanation page
        return <ConstraintExplanation />; 
    }
  };

  return (
    <Layout 
      activePage={activePage} 
      setActivePage={setActivePage}
      username="Shinn Thant"
      onLogout={() => console.log("Logging out...")}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;