import React, { useState, useEffect, useRef } from 'react';
import './University.css';
import { apiFetch } from './utils/apiClient';

const API_BASE = 'http://localhost:8080/api';

export default function UniversityConfigManager() {
    const [activeTab, setActiveTab] = useState('departments');
    const [errorMessage, setErrorMessage] = useState(null); 

    return (
        <div className="uni-config-wrapper">
            {/* 3. Enterprise Error Modal Overlay */}
            {errorMessage && (
                <div className="modal-overlay" onClick={() => setErrorMessage(null)}>
                    <div className="enterprise-modal error-modal" style={{ maxWidth: '420px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-body">
                            <div style={{ backgroundColor: '#FEF2F2', color: '#EF4444', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '18px' }}>Action Blocked</h3>
                            <p style={{ fontSize: '14px', color: '#374151', fontWeight: '500', marginBottom: '24px', lineHeight: '1.5' }}>
                                {errorMessage}
                            </p>
                            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setErrorMessage(null)}>
                                Acknowledge
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="config-header">
                <div>
                    <h2>University Configuration</h2>
                    <p>Manage core institutional data: Departments, Majors, Rooms, Sessions, and Subjects.</p>
                </div>
            </div>

            <div className="config-tabs">
                <button className={activeTab === 'departments' ? 'active' : ''} onClick={() => setActiveTab('departments')}>Departments</button>
                <button className={activeTab === 'majors' ? 'active' : ''} onClick={() => setActiveTab('majors')}>Academic Majors</button>
                <button className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>Campus Rooms</button>
                <button className={activeTab === 'subjects' ? 'active' : ''} onClick={() => setActiveTab('subjects')}>Curriculum Subjects</button>
                <button className={activeTab === 'sessions' ? 'active' : ''} onClick={() => setActiveTab('sessions')}>Class Sessions</button>
            </div>

            <div className="config-content">
            {activeTab === 'departments' && <DepartmentManager showError={setErrorMessage} />}
                {activeTab === 'majors' && <MajorManager showError={setErrorMessage} />}
                {activeTab === 'rooms' && <RoomManager showError={setErrorMessage} />}
                {activeTab === 'subjects' && <SubjectManager showError={setErrorMessage} />}
                {activeTab === 'sessions' && <SessionManager showError={setErrorMessage} />}
            </div>
        </div>
    );
}

// ==========================================
// 1. DEPARTMENT MANAGER (NEW)
// ==========================================
function DepartmentManager({ showError }) {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '' });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/department`).then(r => r.json()).then(setDepartments).finally(() => setLoading(false));
    }, []);

    const handleSave = async (id, isNew = false) => {
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? `${API_BASE}/department` : `${API_BASE}/department/${id}`;
        
        try {
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm)
            });
            if (res.ok) {
                const updated = await res.json();
                if (isNew) setDepartments([...departments, updated]);
                else setDepartments(departments.map(d => d.id === id ? updated : d));
                setEditingId(null); setIsAdding(false);
            } else {
                alert("Failed to save department. Name must be unique.");
            }
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Delete this department?`)) return;
        
        try {
            // Replaced raw fetch with apiFetch
            await apiFetch(`${API_BASE}/department/${id}`, { method: 'DELETE' });
            setDepartments(departments.filter(d => d.id !== id));
        } catch (error) {
            // Surfacing the exact backend error to the modal
            showError(error.message); 
        }
    };

    return (
        <div className="data-grid-container">
            <div className="grid-toolbar">
                <h3>Managed Departments</h3>
                <button className="btn-primary" onClick={() => { setIsAdding(true); setEditForm({ name: '' }); }}>+ Add Department</button>
            </div>
            <table className="data-table">
                <thead><tr><th>ID</th><th>Department Name</th><th className="actions-col">Actions</th></tr></thead>
                <tbody>
                    {isAdding && (
                        <tr className="editing-row">
                            <td><span className="text-muted">Auto</span></td>
                            <td><input type="text" placeholder="e.g. Faculty of Science" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                            <td><ActionButtons onSave={() => handleSave(null, true)} onCancel={() => setIsAdding(false)} /></td>
                        </tr>
                    )}
                    {departments.map(d => (
                        <tr key={d.id}>
                            <td><span className="badge-id">{d.id}</span></td>
                            <td className="fw-500">{editingId === d.id ? <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /> : d.name}</td>
                            <td>{editingId === d.id ? <ActionButtons onSave={() => handleSave(d.id)} onCancel={() => setEditingId(null)} /> : <EditDeleteButtons onEdit={() => { setEditingId(d.id); setEditForm(d); }} onDelete={() => handleDelete(d.id)} />}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ==========================================
// 2. MAJOR MANAGER 
// ==========================================
function MajorManager() {
    const [majors, setMajors] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ id: '', name: '', academicYear: 2026, semester: 1 });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => { fetch(`${API_BASE}/major`).then(r => r.json()).then(setMajors); }, []);

    const handleSave = async (id, isNew = false) => {
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? `${API_BASE}/major` : `${API_BASE}/major/${id}`;
        
        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
            if (res.ok) {
                const updated = await res.json();
                if (isNew) setMajors([...majors, updated]);
                else setMajors(majors.map(m => m.id === id ? updated : m));
                setEditingId(null); setIsAdding(false);
            }
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Delete major ${id}?`)) return;
        await fetch(`${API_BASE}/major/${id}`, { method: 'DELETE' });
        setMajors(majors.filter(m => m.id !== id));
    };

    return (
        <div className="data-grid-container">
            <div className="grid-toolbar">
                <h3>Academic Majors</h3>
                <button className="btn-primary" onClick={() => { setIsAdding(true); setEditForm({ id: '', name: '', academicYear: 2026, semester: 1 }); }}>+ Add Major</button>
            </div>
            <table className="data-table">
                <thead><tr><th>Major ID</th><th>Name</th><th>Academic Year</th><th>Semester</th><th className="actions-col">Actions</th></tr></thead>
                <tbody>
                    {isAdding && (
                        <tr className="editing-row">
                            <td><input type="text" placeholder="e.g. CS-01" value={editForm.id} onChange={e => setEditForm({...editForm, id: e.target.value})} /></td>
                            <td><input type="text" placeholder="Computer Science" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                            <td><input type="number" value={editForm.academicYear} onChange={e => setEditForm({...editForm, academicYear: e.target.value})} /></td>
                            <td><input type="number" value={editForm.semester} onChange={e => setEditForm({...editForm, semester: e.target.value})} /></td>
                            <td><ActionButtons onSave={() => handleSave(editForm.id, true)} onCancel={() => setIsAdding(false)} /></td>
                        </tr>
                    )}
                    {majors.map(m => (
                        <tr key={m.id}>
                            <td><span className="badge-id">{m.id}</span></td>
                            <td>{editingId === m.id ? <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /> : m.name}</td>
                            <td>{editingId === m.id ? <input type="number" value={editForm.academicYear} onChange={e => setEditForm({...editForm, academicYear: e.target.value})} /> : m.academicYear}</td>
                            <td>{editingId === m.id ? <input type="number" value={editForm.semester} onChange={e => setEditForm({...editForm, semester: e.target.value})} /> : m.semester}</td>
                            <td>{editingId === m.id ? <ActionButtons onSave={() => handleSave(m.id)} onCancel={() => setEditingId(null)} /> : <EditDeleteButtons onEdit={() => { setEditingId(m.id); setEditForm(m); }} onDelete={() => handleDelete(m.id)} />}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ==========================================
// 3. ROOM MANAGER
// ==========================================
function RoomManager({ showError }) {
    const [rooms, setRooms] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', floor: 1, capacity: 50, roomType: 'LECTURE' });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => { fetch(`${API_BASE}/room`).then(r => r.json()).then(setRooms); }, []);

    const handleSave = async (id, isNew = false) => {
        const url = isNew ? `${API_BASE}/room` : `${API_BASE}/room/${id}`;
        const res = await fetch(url, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
        if (res.ok) {
            const data = await res.json();
            isNew ? setRooms([...rooms, data]) : setRooms(rooms.map(r => r.id === id ? data : r));
            setEditingId(null); setIsAdding(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete room?")) return;
        
        try {
            await apiFetch(`${API_BASE}/room/${id}`, { method: 'DELETE' });
            setRooms(rooms.filter(r => r.id !== id));
        } catch (error) {
            showError(error.message);
        }
    };

    return (
        <div className="data-grid-container">
            <div className="grid-toolbar">
                <h3>Physical Rooms</h3>
                <button className="btn-primary" onClick={() => { setIsAdding(true); setEditForm({ name: '', floor: 1, capacity: 50, roomType: 'LECTURE' }); }}>+ Add Room</button>
            </div>
            <table className="data-table">
                <thead><tr><th>Room Name</th><th>Type</th><th>Floor</th><th>Capacity</th><th className="actions-col">Actions</th></tr></thead>
                <tbody>
                    {isAdding && (
                        <tr className="editing-row">
                            <td><input type="text" placeholder="e.g. Hall A" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                            <td><select value={editForm.roomType} onChange={e => setEditForm({...editForm, roomType: e.target.value})}><option value="LECTURE">Lecture</option><option value="LAB">Lab</option><option value="THEATER">Theater</option></select></td>
                            <td><input type="number" value={editForm.floor} onChange={e => setEditForm({...editForm, floor: e.target.value})} /></td>
                            <td><input type="number" value={editForm.capacity} onChange={e => setEditForm({...editForm, capacity: e.target.value})} /></td>
                            <td><ActionButtons onSave={() => handleSave(null, true)} onCancel={() => setIsAdding(false)} /></td>
                        </tr>
                    )}
                    {rooms.map(r => (
                        <tr key={r.id}>
                            <td className="fw-500">{editingId === r.id ? <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /> : r.name}</td>
                            <td>{editingId === r.id ? <select value={editForm.roomType} onChange={e => setEditForm({...editForm, roomType: e.target.value})}><option value="LECTURE">Lecture</option><option value="LAB">Lab</option><option value="THEATER">Theater</option></select> : <span className={`type-badge ${r.roomType.toLowerCase()}`}>{r.roomType}</span>}</td>
                            <td>{editingId === r.id ? <input type="number" value={editForm.floor} onChange={e => setEditForm({...editForm, floor: e.target.value})} /> : `Level ${r.floor}`}</td>
                            <td>{editingId === r.id ? <input type="number" value={editForm.capacity} onChange={e => setEditForm({...editForm, capacity: e.target.value})} /> : `${r.capacity} Seats`}</td>
                            <td>{editingId === r.id ? <ActionButtons onSave={() => handleSave(r.id)} onCancel={() => setEditingId(null)} /> : <EditDeleteButtons onEdit={() => { setEditingId(r.id); setEditForm(r); }} onDelete={() => handleDelete(r.id)} />}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ==========================================
// 4. SESSION MANAGER (UPDATED: Searchable Subjects)
// ==========================================
function SessionManager({ showError }) {
    const [sessions, setSessions] = useState([]);
    const [majors, setMajors] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', majorId: '', totalStudent: 30, subjectIds: [] });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE}/session`).then(r => r.json()).then(setSessions);
        fetch(`${API_BASE}/major`).then(r => r.json()).then(setMajors);
        fetch(`${API_BASE}/subject/label`).then(r => r.json()).then(setSubjects);
    }, []);

    const handleSave = async (id, isNew = false) => {
        const url = isNew ? `${API_BASE}/session` : `${API_BASE}/session/${id}`;
        const res = await fetch(url, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) });
        if (res.ok) {
            const freshSessions = await fetch(`${API_BASE}/session`).then(r => r.json());
            setSessions(freshSessions);
            setEditingId(null); setIsAdding(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete session?")) return;
        
        try {
            await apiFetch(`${API_BASE}/session/${id}`, { method: 'DELETE' });
            setSessions(sessions.filter(s => s.id !== id));
        } catch (error) {
            showError(error.message);
        }
    };

    return (
        <div className="data-grid-container" style={{ overflow: 'visible' }}>
            <div className="grid-toolbar">
                <h3>Student Sessions (Cohorts)</h3>
                <button className="btn-primary" onClick={() => { setIsAdding(true); setEditForm({ name: '', majorId: majors[0]?.id || '', totalStudent: 30, subjectIds: [] }); }}>+ Add Session</button>
            </div>
            
            <div style={{ overflow: 'visible' }}>
                <table className="data-table">
                    <thead><tr><th>Session Name</th><th>Assigned Major</th><th>Curriculum Subjects</th><th>Total Students</th><th className="actions-col">Actions</th></tr></thead>
                    <tbody>
                        {isAdding && (
                            <tr className="editing-row">
                                <td><input type="text" placeholder="e.g. Year 1 - Sec A" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                                <td><select value={editForm.majorId} onChange={e => setEditForm({...editForm, majorId: e.target.value})}><option value="">Select Major...</option>{majors.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}</select></td>
                                <td>
                                    <InlineSubjectSearch 
                                        options={subjects} 
                                        selectedIds={editForm.subjectIds} 
                                        onChange={(ids) => setEditForm({...editForm, subjectIds: ids})} 
                                    />
                                </td>
                                <td><input type="number" value={editForm.totalStudent} onChange={e => setEditForm({...editForm, totalStudent: e.target.value})} /></td>
                                <td><ActionButtons onSave={() => handleSave(null, true)} onCancel={() => setIsAdding(false)} /></td>
                            </tr>
                        )}
                        {sessions.map(s => (
                            <tr key={s.id}>
                                <td className="fw-500">{editingId === s.id ? <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /> : s.name}</td>
                                
                                {/* Updated to use s.majorName safely */}
                                <td>{editingId === s.id ? <select value={editForm.majorId} onChange={e => setEditForm({...editForm, majorId: e.target.value})}><option value="">Select Major...</option>{majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select> : <span className="subject-tag">{s.majorName || 'Unassigned'}</span>}</td>
                                
                                <td>
                                    {editingId === s.id ? (
                                        <InlineSubjectSearch 
                                            options={subjects} 
                                            selectedIds={editForm.subjectIds} 
                                            onChange={(ids) => setEditForm({...editForm, subjectIds: ids})} 
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {s.subjects && s.subjects.length > 0 
                                                ? s.subjects.map(sub => <span key={sub.id} className="badge-id" style={{fontSize: '11px'}}>{sub.subjectCode}</span>)
                                                : <span className="text-muted">None</span>
                                            }
                                        </div>
                                    )}
                                </td>

                                <td>{editingId === s.id ? <input type="number" value={editForm.totalStudent} onChange={e => setEditForm({...editForm, totalStudent: e.target.value})} /> : `${s.totalStudent} Students`}</td>
                                
                                {/* Updated the Edit Button to correctly parse s.majorId */}
                                <td>{editingId === s.id ? <ActionButtons onSave={() => handleSave(s.id)} onCancel={() => setEditingId(null)} /> : <EditDeleteButtons onEdit={() => { setEditingId(s.id); setEditForm({ name: s.name, majorId: s.majorId || '', totalStudent: s.totalStudent, subjectIds: s.subjects?.map(sub => sub.id) || [] }); }} onDelete={() => handleDelete(s.id)} />}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Enterprise Searchable Multi-Select Component for Inline Editing
function InlineSubjectSearch({ options, selectedIds, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleId = (id) => {
        if (selectedIds.includes(id)) onChange(selectedIds.filter(i => i !== id));
        else onChange([...selectedIds, id]);
    };

    const filtered = options.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="custom-dropdown-container" ref={ref} style={{ width: '220px' }}>
            <div className="select-box" style={{ padding: '8px 10px', fontSize: '13px', backgroundColor: 'white', border: '1px solid #D1D5DB', borderRadius: '6px' }} onClick={() => setIsOpen(!isOpen)}>
                {selectedIds.length === 0 ? "Select Subjects..." : `${selectedIds.length} Selected`}
                <span className="arrow">▼</span>
            </div>
            {isOpen && (
                <div className="dropdown-menu dropdown-menu-large" style={{ top: '100%', left: 0, zIndex: 100, width: '280px' }}>
                    <div className="search-wrapper">
                        <input type="text" className="search-subject" placeholder="Search subjects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
                    </div>
                    <div className="options-list" style={{ maxHeight: '180px' }}>
                        {filtered.length === 0 ? <div className="no-results">No matches found.</div> : filtered.map(opt => (
                            <label key={opt.id} className="option-item checkbox-item" style={{ padding: '8px 12px' }}>
                                <input type="checkbox" checked={selectedIds.includes(opt.id)} onChange={() => toggleId(opt.id)} />
                                <span style={{ fontSize: '13px' }}>{opt.name} <strong style={{ color: '#6B7280' }}>({opt.subjectCode})</strong></span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// 5. SUBJECT MANAGER (UPDATED: Removed Major Link)
// ==========================================
function SubjectManager({ showError }) {
    const [subjects, setSubjects] = useState([]);
    
    // Sort States
    const [sortBy, setSortBy] = useState('subjectCode');
    const [sortDir, setSortDir] = useState('asc');
    
    // Modal & Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ subjectCode: '', name: '', totalWeeklyPeriod: 4, subjectType: 'MAJOR', isLabSubject: false });

    const fetchSubjects = () => {
        fetch(`${API_BASE}/subject?sortBy=${sortBy}&sortDir=${sortDir}&size=100`)
            .then(r => r.json())
            .then(data => setSubjects(data.content || data))
            .catch(err => console.error("Error fetching subjects:", err));
    };

    useEffect(() => { fetchSubjects(); }, [sortBy, sortDir]);

    const handleSort = (column) => {
        if (sortBy === column) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        else { setSortBy(column); setSortDir('asc'); }
    };

    const renderSortIcon = (column) => {
        if (sortBy !== column) return <span className="sort-icon inactive" style={{marginLeft:'4px', fontSize:'12px', color:'#D1D5DB'}}>▼</span>;
        return <span className="sort-icon active" style={{marginLeft:'4px', fontSize:'12px', color:'#8B5CF6', fontWeight:'bold'}}>{sortDir === 'asc' ? '▲' : '▼'}</span>;
    };

    const openModalForAdd = () => {
        setEditingId(null);
        setEditForm({ subjectCode: '', name: '', totalWeeklyPeriod: 4, subjectType: 'MAJOR', isLabSubject: false });
        setIsModalOpen(true);
    };

    const openModalForEdit = (subject) => {
        const rowId = subject.id || subject.subjectCode;
        setEditingId(rowId);
        setEditForm({ 
             subjectCode: subject.subjectCode, 
             name: subject.name, 
             totalWeeklyPeriod: subject.totalWeeklyPeriod, 
             subjectType: subject.subjectType, 
             isLabSubject: subject.isLabSubject || false
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const url = editingId ? `${API_BASE}/subject/${editingId}` : `${API_BASE}/subject`;
        const method = editingId ? 'PUT' : 'POST';
        
        try {
            const res = await fetch(url, { 
                 method: method, 
                 headers: { 'Content-Type': 'application/json' }, 
                 body: JSON.stringify(editForm) 
             });
            if (res.ok) {
                fetchSubjects();
                setIsModalOpen(false);
            } else alert("Failed to save subject.");
        } catch (error) { console.error("Error saving subject:", error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subject?")) return;
        
        try {
            await apiFetch(`${API_BASE}/subject/${id}`, { method: 'DELETE' });
            setSubjects(subjects.filter(s => (s.id || s.subjectCode) !== id));
        } catch (error) {
            showError(error.message);
        }
    };

    return (
        <div className="data-grid-container">
            <div className="grid-toolbar">
                <h3>Curriculum Course Catalog</h3>
                <button className="btn-primary" onClick={openModalForAdd}>+ Add Subject</button>
            </div>
            
            <table className="data-table">
                <thead>
                    <tr>
                        <th onClick={() => handleSort('subjectCode')} className="sortable">Code {renderSortIcon('subjectCode')}</th>
                        <th onClick={() => handleSort('name')} className="sortable">Subject Name {renderSortIcon('name')}</th>
                        <th onClick={() => handleSort('subjectType')} className="sortable">Type / Lab {renderSortIcon('subjectType')}</th>
                        <th onClick={() => handleSort('totalWeeklyPeriod')} className="sortable">Weekly Periods {renderSortIcon('totalWeeklyPeriod')}</th>
                        <th className="actions-col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.length === 0 ? (
                        <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#6B7280'}}>No subjects available.</td></tr>
                    ) : (
                        subjects.map(s => {
                            const rowId = s.id || s.subjectCode; 
                            return (
                            <tr key={rowId}>
                                <td><span className="badge-id">{s.subjectCode}</span></td>
                                <td className="fw-500">{s.name}</td>
                                <td>
                                    <div style={{display:'flex', flexDirection:'column', gap:'6px', alignItems: 'flex-start'}}>
                                    <span className={`type-badge ${s.subjectType.toLowerCase()}`}>
                                        {s.subjectType}
                                    </span>
                                        {s.isLabSubject && (
                                            <span className="lab-badge" title="Requires Laboratory Facility">
                                                <svg className="lab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M10 2v7.31"></path><path d="M14 9.3V1.99"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path>
                                                </svg>
                                                Lab Required
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>{s.totalWeeklyPeriod}</td>
                                <td>
                                    <EditDeleteButtons onEdit={() => openModalForEdit(s)} onDelete={() => handleDelete(rowId)} />
                                </td>
                            </tr>
                        )})
                    )}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="enterprise-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingId ? 'Edit Curriculum Subject' : 'Add New Subject'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>✖</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Subject Code</label>
                                    <input type="text" value={editForm.subjectCode} onChange={e => setEditForm({...editForm, subjectCode: e.target.value})} placeholder="e.g. CS-101" />
                                </div>
                                <div className="form-group">
                                    <label>Subject Name</label>
                                    <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="e.g. Intro to Programming" />
                                </div>
                                <div className="form-group">
                                    <label>Subject Type</label>
                                    <select value={editForm.subjectType} onChange={e => setEditForm({...editForm, subjectType: e.target.value})}>
                                        <option value="MAJOR">Major</option>
                                        <option value="MINOR">Minor</option>
                                        <option value="ELECTIVE">Elective</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Weekly Periods</label>
                                    <input type="number" value={editForm.totalWeeklyPeriod} onChange={e => setEditForm({...editForm, totalWeeklyPeriod: e.target.value})} min="1" />
                                </div>
                                <div className="form-group full-width checkbox-group">
                                    <label className="checkbox-label">
                                        <input type="checkbox" checked={editForm.isLabSubject} onChange={e => setEditForm({...editForm, isLabSubject: e.target.checked})} />
                                        <div className="checkbox-text">
                                            <strong>Requires Laboratory Facility</strong>
                                            <span>Check this if the subject must be scheduled in a Lab room</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave}>{editingId ? 'Update Subject' : 'Save Subject'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// SHARED ENTERPRISE UI COMPONENTS
// ==========================================
function ActionButtons({ onSave, onCancel }) {
    return (
        <div className="action-cell">
            <button className="action-icon-btn check" onClick={onSave} title="Save"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></button>
            <button className="action-icon-btn cancel" onClick={onCancel} title="Cancel"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
    );
}

function EditDeleteButtons({ onEdit, onDelete }) {
    return (
        <div className="action-cell">
            <button className="action-icon-btn edit" onClick={onEdit} title="Edit"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
            <button className="action-icon-btn delete" onClick={onDelete} title="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
        </div>
    );
}