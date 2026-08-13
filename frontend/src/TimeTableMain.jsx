import React, { useState, useEffect, useRef } from 'react';
import './TimeTableMain.css';
import { apiFetch } from './utils/apiClient';

// --- ENTERPRISE CUSTOM DROPDOWN COMPONENT (SINGLE) ---
const CustomDropdown = ({ options, value, onChange, placeholder, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div className={`custom-select-container ${className}`} ref={dropdownRef}>
      <div 
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!selectedOption ? 'placeholder-text' : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg className="custom-select-arrow" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      
      {isOpen && (
        <div className="custom-select-dropdown">
          {options.length === 0 ? (
            <div className="custom-select-option disabled">No options available</div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                className={`custom-select-option ${String(value) === String(option.value) ? 'selected' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// --- ENTERPRISE MULTI-SELECT DROPDOWN COMPONENT (WITH SEARCH) ---
const MultiSelectDropdown = ({ options, selectedValues, onChange, placeholder, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery(''); 
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleValue = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`custom-select-container ${className}`} ref={dropdownRef}>
      <div 
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedValues.length === 0 ? 'placeholder-text' : ''}>
          {selectedValues.length === 0 ? placeholder : `${selectedValues.length} Teacher(s) Excluded`}
        </span>
        <svg className="custom-select-arrow" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      
      {isOpen && (
        <div className="custom-select-dropdown" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', position: 'sticky', top: 0, zIndex: 2 }}>
            <input 
              type="text"
              className="enterprise-input"
              placeholder="Search teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px' }}
              autoFocus
            />
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
            {filteredOptions.length === 0 ? (
              <div className="custom-select-option disabled">No matches found</div>
            ) : (
              filteredOptions.map((option) => (
                <label key={option.value} className="multi-select-option">
                  <input 
                    type="checkbox" 
                    className="multi-select-checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => toggleValue(option.value)}
                  />
                  {option.label}
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// MAIN TIMETABLE COMPONENT
// ==========================================
export default function Timetable() {
  const [sessions, setSessions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [excludedTeacherIds, setExcludedTeacherIds] = useState([]);
  const [classPeriods, setClassPeriods] = useState([]);
  const [timetableSlots, setTimetableSlots] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  
  const [notification, setNotification] = useState({ visible: false, message: '', type: '' });
  const [generationError, setGenerationError] = useState(null);
  
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodForm, setPeriodForm] = useState({ name: '', startTime: '', endTime: '', type: 'LECTURE' });

  // Manual Slot Modal States
  const [slotModal, setSlotModal] = useState({ isOpen: false, mode: 'ADD', slotId: null, dayOfWeek: '', classPeriodId: '' });
  const [slotForm, setSlotForm] = useState({ subjectId: '', teacherId: '', roomId: '' });

  // Danger Menu States
  const [dangerMenuOpen, setDangerMenuOpen] = useState(false);
  const dangerMenuRef = useRef(null);
  const [confirmAction, setConfirmAction] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Intelligent Subject Coloring
  const subjectColors = [
    { bg: '#EEF2FF', border: '#6366F1', text: '#3730A3' },
    { bg: '#F0FDF4', border: '#22C55E', text: '#166534' },
    { bg: '#FFFBEB', border: '#F59E0B', text: '#78350F' },
    { bg: '#FEF2F2', border: '#EF4444', text: '#7F1D1D' },
    { bg: '#F5F3FF', border: '#8B5CF6', text: '#4C1D95' },
    { bg: '#ECFEFF', border: '#06B6D4', text: '#164E63' },
    { bg: '#FDF4FF', border: '#D946EF', text: '#701A75' },
    { bg: '#F0F9FF', border: '#0EA5E9', text: '#0C4A6E' },
    { bg: '#FFF1F2', border: '#F43F5E', text: '#881337' },
    { bg: '#F4F4F5', border: '#71717A', text: '#27272A' },
    { bg: '#FFF7ED', border: '#F97316', text: '#7C2D12' },
    { bg: '#F0FDFA', border: '#14B8A6', text: '#134E4A' }
  ];

  const getSubjectStyle = (subjectName) => {
    if (!subjectName) return subjectColors[0];
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    return subjectColors[Math.abs(hash) % subjectColors.length];
  };

  useEffect(() => {
    fetchPeriods();
    fetchSessions();
    fetchTeachers();
    fetchLookups();
    checkInitialSolverStatus();
  }, []);

  useEffect(() => {
    if (selectedSessionId) fetchTimetable(selectedSessionId);
    else setTimetableSlots([]);
  }, [selectedSessionId]);

  // Close danger menu on outside click
  useEffect(() => {
      const handleClickOutside = (event) => {
          if (dangerMenuRef.current && !dangerMenuRef.current.contains(event.target)) {
              setDangerMenuOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLookups = async () => {
    try {
        const [rRes, sRes] = await Promise.all([
            fetch('http://localhost:8082/api/room'),
            fetch('http://localhost:8082/api/subject/label')
        ]);
        if (rRes.ok) setRooms(await rRes.json());
        if (sRes.ok) setSubjects(await sRes.json());
    } catch (e) { console.error("Error fetching lookups", e); }
  };

  const checkInitialSolverStatus = async () => {
    try {
        const res = await fetch('http://localhost:8082/api/timetable/status');
        const data = await res.json();
        if (data.status === 'SOLVING_ACTIVE' || data.status === 'SOLVING_SCHEDULED') {
            setIsLoading(true);
            setIsSolving(true);
            pollSolverStatus();
        }
    } catch (e) {}
  };

  const fetchPeriods = async () => {
    try {
      const res = await fetch('http://localhost:8082/api/period');
      if (res.ok) {
        const data = await res.json();
        setClassPeriods(data.sort((a, b) => a.startTime.localeCompare(b.startTime)));
      }
    } catch (error) { console.error("Error fetching periods", error); }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('http://localhost:8082/api/session');
      if (res.ok) setSessions(await res.json());
    } catch (error) { console.error("Error fetching sessions", error); }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('http://localhost:8082/api/teacher?size=1000');
      if (res.ok) {
        const data = await res.json();
        setTeachers(data.content || data);
      }
    } catch (error) { console.error("Error fetching teachers", error); }
  };

  const fetchTimetable = async (sessionId) => {
    setIsLoading(true);
    try {
        const res = await fetch(`http://localhost:8082/api/timetable/session/${sessionId}`);
        if (res.ok) setTimetableSlots(await res.json());
        else setTimetableSlots([]);
    } catch (error) {
        showNotification('Backend API error while fetching schedule.', 'error');
    } finally {
        setIsLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ visible: true, message, type });
    setTimeout(() => setNotification({ visible: false, message: '', type: '' }), 5000);
  };

  const pollSolverStatus = async () => {
    try {
        const res = await fetch('http://localhost:8082/api/timetable/status');
        const data = await res.json();
        
        if (data.status === 'SOLVING_ACTIVE' || data.status === 'SOLVING_SCHEDULED') {
            setTimeout(pollSolverStatus, 1000); 
        } else {
            setIsLoading(false);
            setIsSolving(false);
            showNotification('Global Schedule Generated Successfully!');
            if (selectedSessionId) fetchTimetable(selectedSessionId);
        }
    } catch (error) {
        setIsLoading(false);
        setIsSolving(false);
        showNotification('Error checking AI status', 'error');
    }
  };

  const handleGenerate = async () => {
    const confirmRegen = window.confirm("⚠️ AI SOLVER: You are about to run the Timefold Global Solver.\n\nThis will look at ALL sessions and teachers and generate a master schedule. Continue?");
    if (!confirmRegen) return;
    
    setIsLoading(true);
    setIsSolving(true);
    setGenerationError(null);
    
    try {
        const res = await fetch(`http://localhost:8082/api/timetable/generate/all`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ excludedTeacherIds: excludedTeacherIds })
        });
        
        if (!res.ok) {
            let errMsg = "The AI failed to initialize.";
            try {
                const errData = await res.json();
                if (errData.message) errMsg = errData.message;
            } catch(e) {}
            throw new Error(errMsg);
        }
        
        setTimeout(pollSolverStatus, 1000);
        
    } catch (error) {
        setGenerationError(error.message); 
        setIsLoading(false);
        setIsSolving(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm("Publish this schedule? This will finalize the draft and make it visible to students.")) return;
    
    setIsLoading(true);
    try {
        await apiFetch(`http://localhost:8082/api/timetable/session/${selectedSessionId}/publish`, { method: 'POST' });
        showNotification('Schedule published successfully!');
        fetchTimetable(selectedSessionId); 
    } catch (error) { 
        setGenerationError(error.message); 
    } finally {
        setIsLoading(false);
    }
  };

  // --- CONSOLIDATED DELETION HANDLER ---
  const executeDeletion = async (endpoint, successMessage) => {
    setIsLoading(true);
    try {
        await apiFetch(`http://localhost:8082/api/timetable/${endpoint}`, { method: 'DELETE' });
        showNotification(successMessage);
        if (selectedSessionId) fetchTimetable(selectedSessionId);
    } catch (err) {
        showNotification(err.message, 'error');
    } finally {
        setIsLoading(false);
        setConfirmAction({ isOpen: false, title: '', message: '', onConfirm: null });
    }
  };

  const openConfirmModal = (title, message, endpoint, successMessage) => {
    setDangerMenuOpen(false);
    setConfirmAction({
        isOpen: true,
        title,
        message,
        onConfirm: () => executeDeletion(endpoint, successMessage)
    });
  };

  const getUniqueLegendInfo = () => {
    const map = new Map();
    timetableSlots.forEach(slot => {
        const key = `${slot.subjectCode}-${slot.teacherName}`;
        if(!map.has(key)) {
            map.set(key, { code: slot.subjectCode, name: slot.subjectName, teacher: slot.teacherName });
        }
    });
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  };

  // --- DRAG AND DROP HANDLERS ---
  const onDragStart = (e, slot) => {
      e.dataTransfer.setData('sourceSlotId', slot.id);
  };

  const onDragOver = (e) => e.preventDefault();

    const onDrop = async (e, targetDay, targetPeriod) => {
        e.preventDefault();
        const sourceSlotIdStr = e.dataTransfer.getData('sourceSlotId');
        if (!sourceSlotIdStr) return;
        const sourceSlotId = parseInt(sourceSlotIdStr, 10);
        const sourceSlot = timetableSlots.find(s => s.id === sourceSlotId);
        if (!sourceSlot) return;

        if (sourceSlot.dayOfWeek === targetDay && sourceSlot.classPeriodId === targetPeriod.id) return;

        const targetSlots = getSlotsForCell(targetDay, targetPeriod.id);
        setIsLoading(true);

        try {
            // --- ENTERPRISE SMART DROP LOGIC ---
            const isSourceElective = sourceSlot.subjectType === 'ELECTIVE';
            const areTargetSlotsElective = targetSlots.length > 0 && targetSlots.every(s => s.subjectType === 'ELECTIVE');

            // Check if we should SWAP or INTEGRATE
            if (targetSlots.length > 0 && !(isSourceElective && areTargetSlotsElective)) {

                // SWAP MODE: Target is occupied by a Major/Minor, or we are dragging a Major/Minor.
                const targetSlotId = targetSlots[0].id;
                await apiFetch(`http://localhost:8082/api/timetable/slot/swap`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slotId1: sourceSlotId, slotId2: targetSlotId })
                });
                showNotification('Slots swapped successfully.');

            } else {

                // INTEGRATION / MOVE MODE: Target is empty, OR we are merging Electives together.
                const payload = {
                    dayOfWeek: targetDay,
                    classPeriodId: targetPeriod.id,
                    roomId: sourceSlot.roomId, // Crucial: Retains its original room during the merge
                    sessionId: selectedSessionId,
                    subjectId: sourceSlot.subjectId,
                    teacherId: sourceSlot.teacherId
                };

                await apiFetch(`http://localhost:8082/api/timetable/slot/${sourceSlotId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                showNotification(targetSlots.length > 0 ? 'Elective integrated successfully.' : 'Slot moved successfully.');
            }

            fetchTimetable(selectedSessionId);

        } catch(err) {
            setGenerationError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

  // --- MANUAL SLOT MODAL HANDLERS ---
  const openAddSlotModal = (day, periodId) => {
      if (!selectedSessionId) return;
      setSlotModal({ isOpen: true, mode: 'ADD', slotId: null, dayOfWeek: day, classPeriodId: periodId });
      setSlotForm({ subjectId: '', teacherId: '', roomId: '' });
  };

  const openEditSlotModal = (slot) => {
      setSlotModal({ isOpen: true, mode: 'EDIT', slotId: slot.id, dayOfWeek: slot.dayOfWeek, classPeriodId: slot.classPeriodId });
      setSlotForm({ subjectId: slot.subjectId, teacherId: slot.teacherId, roomId: slot.roomId });
  };

  const handleSaveSlot = async (e) => {
      e.preventDefault();
      if (!slotForm.subjectId || !slotForm.teacherId || !slotForm.roomId) {
          alert("Please fill all fields."); return;
      }

      const payload = {
          dayOfWeek: slotModal.dayOfWeek,
          classPeriodId: slotModal.classPeriodId,
          sessionId: selectedSessionId,
          subjectId: slotForm.subjectId,
          teacherId: slotForm.teacherId,
          roomId: slotForm.roomId
      };

      setIsLoading(true);
      try {
          if (slotModal.mode === 'ADD') {
              await apiFetch(`http://localhost:8082/api/timetable/slot`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
              });
              showNotification('Slot manually added.');
          } else {
              await apiFetch(`http://localhost:8082/api/timetable/slot/${slotModal.slotId}`, {
                  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
              });
              showNotification('Slot successfully updated.');
          }
          setSlotModal({ ...slotModal, isOpen: false });
          fetchTimetable(selectedSessionId);
      } catch (err) {
          setSlotModal({ ...slotModal, isOpen: false });
          setGenerationError(err.message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleDeleteSlot = async () => {
      if (!window.confirm("Remove this slot from the timetable?")) return;
      setIsLoading(true);
      try {
          await apiFetch(`http://localhost:8082/api/timetable/slot/${slotModal.slotId}`, { method: 'DELETE' });
          showNotification('Slot removed.');
          setSlotModal({ ...slotModal, isOpen: false });
          fetchTimetable(selectedSessionId);
      } catch (err) {
          showNotification('Delete failed.', 'error');
      } finally {
          setIsLoading(false);
      }
  };

  // --- PERIOD HANDLERS ---
  const handlePeriodChange = (e) => setPeriodForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSavePeriod = async (e) => {
    e.preventDefault();
    try {
        const reqStartTime = periodForm.startTime.length === 5 ? periodForm.startTime + ":00" : periodForm.startTime;
        const reqEndTime = periodForm.endTime.length === 5 ? periodForm.endTime + ":00" : periodForm.endTime;
        const payload = { ...periodForm, startTime: reqStartTime, endTime: reqEndTime };
        
        await apiFetch('http://localhost:8082/api/period', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        showNotification('Class Period successfully added!');
        fetchPeriods();
        setPeriodForm({ name: '', startTime: '', endTime: '', type: 'LECTURE' });
    } catch(err) { showNotification(err.message, 'error'); }
  };

  const handleDeletePeriod = async (id) => {
      if(!window.confirm("Delete this period structure? This might break existing timetables!")) return;
      try {
          await apiFetch(`http://localhost:8082/api/period/${id}`, { method: 'DELETE' });
          showNotification('Period removed.');
          fetchPeriods();
      } catch(err) { showNotification(err.message, 'error'); }
  };

  const getSlotsForCell = (day, periodId) => timetableSlots.filter(slot => slot.dayOfWeek === day && slot.classPeriodId === periodId);

  const getBreakIcon = (type) => {
    switch (type) {
        case 'LUNCH':
            return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>;
        case 'RECESS':
            return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>;
        default:
            return null;
    }
  };

  const sessionOptions = sessions.map(s => ({
    value: s.id,
    label: `${s.name} (${s.majorName || 'Unassigned'})` 
  }));

  const teacherOptions = teachers.map(t => ({
    value: t.id,
    label: `${t.name} (${t.id})`
  }));

  const roomOptions = rooms.map(r => ({ value: r.id, label: r.name }));
  const currentSession = sessions.find(s => String(s.id) === String(selectedSessionId));
  const subjectOptions = currentSession && currentSession.subjects 
      ? currentSession.subjects.map(s => ({ value: s.id, label: `${s.name} (${s.subjectCode})` }))
      : subjects.map(s => ({ value: s.id, label: `${s.name} (${s.subjectCode})` }));

  const blockTypeOptions = [
    { value: 'LECTURE', label: 'LECTURE (Instructional Time)' },
    { value: 'RECESS', label: 'RECESS (Short Break)' },
    { value: 'LUNCH', label: 'LUNCH (Long Break)' }
  ];

  const sessionStatus = timetableSlots.length > 0 ? timetableSlots[0].status : null;

  return (
    <div className="timetable-container">
      {notification.visible && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.type === 'success' ? '✅' : '⚠️'}
          <span>{notification.message}</span>
        </div>
      )}

      {/* COMPACT ERROR MODAL */}
      {generationError && (
        <div className="modal-overlay" onClick={() => setGenerationError(null)}>
          <div className="error-modal" onClick={e => e.stopPropagation()}>
            <div className="error-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3>Constraint Violation</h3>
            <p className="error-text">{generationError}</p>
            <div className="error-suggestion">
               <strong>Troubleshooting:</strong><br/>
               1. Check if the Teacher is double-booked at this time.<br/>
               2. Verify the Room capacity fits the Session size.<br/>
               3. Ensure Lab subjects are placed in Lab rooms.
            </div>
            <button className="secondary-btn full-width" onClick={() => setGenerationError(null)}>Acknowledge & Revert</button>
          </div>
        </div>
      )}

      {/* ENTERPRISE ACTION CONFIRMATION MODAL */}
      {confirmAction.isOpen && (
        <div className="modal-overlay" onClick={() => setConfirmAction({ ...confirmAction, isOpen: false })}>
          <div className="error-modal" onClick={e => e.stopPropagation()}>
            <div className="error-icon-wrapper" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3>{confirmAction.title}</h3>
            <p className="error-text">{confirmAction.message}</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setConfirmAction({ ...confirmAction, isOpen: false })}>Cancel</button>
                <button className="action-btn nuclear-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={confirmAction.onConfirm}>Confirm Wipe</button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL SLOT ADD/EDIT MODAL */}
      {slotModal.isOpen && (
         <div className="modal-overlay" onClick={() => setSlotModal({ ...slotModal, isOpen: false })}>
            <div className="floating-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{slotModal.mode === 'ADD' ? 'Assign New Class' : 'Edit Scheduled Class'}</h3>
                    <button className="tm-modal-close-btn" onClick={() => setSlotModal({ ...slotModal, isOpen: false })}>✕</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSaveSlot} className="period-form">
                        <div className="form-group" style={{marginBottom: '16px'}}>
                            <label>Subject</label>
                            <CustomDropdown options={subjectOptions} value={slotForm.subjectId} onChange={val => setSlotForm({...slotForm, subjectId: val})} placeholder="Select Subject" />
                        </div>
                        <div className="form-group" style={{marginBottom: '16px'}}>
                            <label>Teacher</label>
                            <CustomDropdown options={teacherOptions} value={slotForm.teacherId} onChange={val => setSlotForm({...slotForm, teacherId: val})} placeholder="Select Teacher" />
                        </div>
                        <div className="form-group" style={{marginBottom: '24px'}}>
                            <label>Room</label>
                            <CustomDropdown options={roomOptions} value={slotForm.roomId} onChange={val => setSlotForm({...slotForm, roomId: val})} placeholder="Select Room" />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="submit-btn" style={{flex: 1}}>
                                {slotModal.mode === 'ADD' ? 'Save Assignment' : 'Update Assignment'}
                            </button>
                            {slotModal.mode === 'EDIT' && (
                                <button type="button" className="secondary-btn" style={{color: '#DC2626', borderColor: '#FECACA', backgroundColor: '#FEF2F2'}} onClick={handleDeleteSlot}>
                                    Remove Slot
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
         </div>
      )}

      <div className="timetable-header">
        <div className="header-left">
          <h2>Timetable Engine</h2>
          <p>Generate globally, adjust locally, and manage class periods.</p>
        </div>
        <div className="header-right" style={{ display: 'flex', gap: '12px' }}>
                     
          <button className="action-btn generate-btn" onClick={handleGenerate} disabled={isLoading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            {isLoading ? 'Running Timefold AI...' : 'Run Global AI Solver'}
          </button>
          <button className="secondary-btn icon-btn" onClick={() => setShowPeriodModal(true)}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
             Schedule Dictionary
          </button>
        </div>
      </div>

      <div className="control-panel">
      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
          <div className="selector-group" style={{ flex: 1 }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              Target Session
              {sessionStatus && (
                <span className={`status-badge ${sessionStatus}`}>
                  {sessionStatus === 'DRAFT' ? 'DRAFT' : 'PUBLISHED'}
                </span>
              )}
            </label>
            <CustomDropdown 
               options={sessionOptions} 
               value={selectedSessionId} 
               onChange={(val) => setSelectedSessionId(val)} 
               placeholder="Select a Session"
              className="session-dropdown"
            />
          </div>

          <div className="selector-group" style={{ flex: 1 }}>
            <label>Exclude Teachers (Leave/Research)</label>
            <MultiSelectDropdown 
               options={teacherOptions} 
               selectedValues={excludedTeacherIds} 
               onChange={(vals) => setExcludedTeacherIds(vals)} 
               placeholder="Select Teachers to Skip"
              className="session-dropdown"
            />
          </div>
        </div>

        <div className="action-group">
          <button className="action-btn publish-btn" onClick={handlePublish} disabled={!selectedSessionId || timetableSlots.length === 0} title="Publish schedule for this session">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Publish Session
          </button>
          
          <div style={{ position: 'relative' }} ref={dangerMenuRef}>
              <button className="action-btn nuclear-btn" onClick={() => setDangerMenuOpen(!dangerMenuOpen)}>
                Actions
              </button>
              
              {dangerMenuOpen && (
                  <div className="danger-menu">
                      <div className="danger-menu-section">Current Session</div>
                      <div className="danger-item" onClick={() => openConfirmModal('Wipe Session Draft', 'Delete the DRAFT schedule for this specific session?', `session/${selectedSessionId}`, 'Session draft wiped.')}>
                          Wipe Session Draft
                      </div>
                      <div className="danger-item" onClick={() => openConfirmModal('Wipe Session Published', 'Delete the PUBLISHED schedule for this specific session?', `session/${selectedSessionId}/published`, 'Session published wiped.')}>
                          Wipe Session Published
                      </div>
                      
                      <div className="danger-menu-section">Global Actions</div>
                      <div className="danger-item" onClick={() => openConfirmModal('Wipe All Drafts', 'Delete ALL draft schedules across the entire university?', 'drafts/all', 'All global drafts wiped.')}>
                          Wipe All Global Drafts
                      </div>
                      <div className="danger-item" onClick={() => openConfirmModal('Wipe All Published', 'Delete ALL published schedules across the entire university?', 'published/all', 'All global published wiped.')}>
                          Wipe All Global Published
                      </div>
                  </div>
              )}
          </div>
        </div>
      </div>

      {/* THE GRID: X-axis = Days, Y-axis = Periods */}
      {selectedSessionId ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="grid-wrapper">
          <table className="timetable-grid compact">
            <thead>
              <tr>
                <th className="time-col">Time</th>
                {daysOfWeek.map(day => <th key={day}>{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {classPeriods.map(period => (
                <tr key={period.id}>
                  {/* Y-Axis Period Label: Flexbox ensures it stretches and stays centered vertically */}
                  <td className="time-cell" style={{ verticalAlign: 'middle', height: '100%', minHeight: '70px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <div className="period-title">{period.name}</div>
                        <div className="period-time">{period.startTime.substring(0,5)} - {period.endTime.substring(0,5)}</div>
                    </div>
                  </td>
                  
                  {/* PERFECTLY CENTERED BREAK/LUNCH BANNERS */}
                  {period.type !== 'LECTURE' ? (
                     <td colSpan="5" className="drop-zone non-instructional">
                        <div className="break-label">
                          {getBreakIcon(period.type)}
                          <span>{period.name || period.type}</span>
                        </div>
                     </td>
                  ) : (
                    // NORMAL CLASSES
                    daysOfWeek.map(day => {
                    const slotsInCell = getSlotsForCell(day, period.id);
                    return (
                        <td 
                           key={`${day}-${period.id}`} 
                           className="drop-zone"
                          onDragOver={onDragOver}
                          onDrop={(e) => onDrop(e, day, period)}
                          onClick={() => { if (slotsInCell.length === 0) openAddSlotModal(day, period.id); }}
                          style={{ cursor: slotsInCell.length === 0 ? 'pointer' : 'default', verticalAlign: 'top' }}
                        >
                          {slotsInCell.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', height: '100%' }}>
                              {slotsInCell.map(slot => {
                                const sStyle = getSubjectStyle(slot.subjectName);
                                return (
                                  <div 
                                    key={slot.id}
                                    className="slot-card"
                                    draggable
                                    onDragStart={(e) => onDragStart(e, slot)}
                                    onClick={(e) => { e.stopPropagation(); openEditSlotModal(slot); }}
                                    title={`Click to Edit | Drag to Move\n${slot.subjectName} - ${slot.teacherName}`}
                                    style={{ 
                                       flex: 1, minHeight: 0,
                                       backgroundColor: sStyle.bg,
                                       borderLeftColor: sStyle.border,
                                      border: `1px solid ${sStyle.border}`
                                    }}
                                  >
                                    <div className="slot-subject" style={{ color: sStyle.text }}>{slot.subjectCode || slot.subjectName}</div>
                                    <div className="slot-teacher">
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                                      {slot.roomName}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="empty-slot-hint">+ Add / Drop</div>
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Legend Section */}
        {timetableSlots.length > 0 && (
              <div className="timetable-legend">
                <h4>Subject & Teacher Reference</h4>
                <div className="legend-grid">
                  {getUniqueLegendInfo().map((info, idx) => {
                    const sStyle = getSubjectStyle(info.name);
                    return (
                      <div key={idx} className="legend-item">
                        <span className="legend-code" style={{ backgroundColor: sStyle.bg, color: sStyle.text, border: `1px solid ${sStyle.border}` }}>
                          {info.code}
                        </span>
                        <div className="legend-details">
                          <span className="legend-name">{info.name}</span>
                          <span className="legend-teacher">{info.teacher}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
        </div>
        
      ) : (
        <div className="empty-state">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
           <p>Select a Session to view or generate its timetable.</p>
        </div>
      )}

      {/* --- CENTERED FLOATING PERIOD MODAL --- */}
      {showPeriodModal && (
        <div className="modal-overlay" onClick={() => setShowPeriodModal(false)}>
          <div className="floating-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Dictionary</h3>
              <button className="tm-modal-close-btn" onClick={() => setShowPeriodModal(false)} title="Close">✕</button>
            </div>
            
            <div className="modal-body">
               <form onSubmit={handleSavePeriod} className="period-form">
                   <h4>Add New Block</h4>
                   <div className="form-group">
                       <label>Period Name</label>
                       <input type="text" name="name" className="enterprise-input" placeholder="e.g. Period 1, Lunch" value={periodForm.name} onChange={handlePeriodChange} required />
                   </div>
                   <div className="grid-2">
                     <div className="form-group">
                         <label>Start Time</label>
                         <input type="time" name="startTime" className="enterprise-input" value={periodForm.startTime} onChange={handlePeriodChange} required />
                     </div>
                     <div className="form-group">
                         <label>End Time</label>
                         <input type="time" name="endTime" className="enterprise-input" value={periodForm.endTime} onChange={handlePeriodChange} required />
                     </div>
                   </div>
                   <div className="form-group">
                       <label>Block Type</label>
                       <CustomDropdown 
                          options={blockTypeOptions} 
                          value={periodForm.type} 
                          onChange={(val) => setPeriodForm(prev => ({ ...prev, type: val }))} 
                          placeholder="Select Block Type"
                       />
                   </div>
                   <button type="submit" className="submit-btn full-width">+ Append to Schedule</button>
               </form>

               <div className="period-list">
                   <h4>Current Structure</h4>
                   {classPeriods.length === 0 ? <p className="hint">No periods defined.</p> : (
                       classPeriods.map(p => (
                           <div key={p.id} className={`period-item ${p.type.toLowerCase()}`}>
                               <div className="period-info">
                                   <strong>{p.name}</strong> <span className="type-tag">{p.type}</span>
                                   <p>{p.startTime.substring(0,5)} - {p.endTime.substring(0,5)}</p>
                               </div>
                               <button type="button" className="delete-icon" onClick={() => handleDeletePeriod(p.id)} title="Delete Block">
                                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                               </button>
                           </div>
                       ))
                   )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}