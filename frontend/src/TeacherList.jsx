import React, { useState, useEffect, useRef } from 'react';
import './TeacherList.css';
import { apiFetch } from './utils/apiClient';

const TeacherList = ({ onAddClick, onEditClick }) => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('id');[]
    const [sortDir, setSortDir] = useState('asc');

    const [classPeriods, setClassPeriods] = useState([]);
    const [gridModalOpen, setGridModalOpen] = useState(false);
    const [teacherGrid, setTeacherGrid] = useState([]);
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    
    // Filter States
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({
        gender: '',
        teacherType: '',
        subjectId: '',
        departmentId: ''
    });
    
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);
    const [teacherDetail, setTeacherDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

    const fileInputRef = useRef(null);
    const [isImageUploading, setIsImageUploading] = useState(false);

        // NEW: Handler for uploading an image directly from the detail panel
        const handleDetailImageUpload = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
    
            setIsImageUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                // Post directly to backend
                const res = await fetch(`http://localhost:8082/api/teacher/${selectedTeacherId}/upload-img`, {
                    method: 'POST',
                    body: formData
                });
                
                if (!res.ok) throw new Error("Upload failed");
                
                // Refresh main table and detail panel to fetch the new Cloud URL
                fetchTeachers(); 
                const detailRes = await fetch(`http://localhost:8082/api/teacher/${selectedTeacherId}`);
                setTeacherDetail(await detailRes.json());
                
            } catch (err) {
                alert("Failed to upload image. Please try again.");
            } finally {
                setIsImageUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = ''; 
            }
        };
    
        // NEW: Handler for deleting an image directly from the detail panel
        const handleDetailImageDelete = async () => {
            if (!window.confirm("Are you sure you want to remove this profile picture?")) return;
            
            setIsImageUploading(true);
            try {
                const res = await fetch(`http://localhost:8082/api/teacher/${selectedTeacherId}/delete-img`, {
                    method: 'DELETE'
                });
                
                if (!res.ok) throw new Error("Delete failed");
                
                // Refresh table and detail panel to remove the image from the UI
                fetchTeachers();
                const detailRes = await fetch(`http://localhost:8082/api/teacher/${selectedTeacherId}`);
                setTeacherDetail(await detailRes.json());
                
            } catch (err) {
                alert("Failed to delete image.");
            } finally {
                setIsImageUploading(false);
            }
        };

    // --- ENTERPRISE TYPEAHEAD SELECT COMPONENT ---
const EnterpriseSearchableSelect = ({ options, value, onChange, placeholder, searchHint }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const ref = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);
    const filteredOptions = options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="custom-dropdown-container" ref={ref}>
            <div className="select-box filter-select" onClick={() => setIsOpen(!isOpen)}>
                {selectedOption ? <span style={{ color: '#111827', fontWeight: 500 }}>{selectedOption.label}</span> : placeholder}
                <span className="arrow">▼</span>
            </div>
            
            {isOpen && (
                <div className="dropdown-menu dropdown-menu-large">
                    <div className="search-wrapper">
                        <input 
                            type="text" 
                            className="search-subject" 
                            placeholder={searchHint || "Start typing..."} 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            autoFocus 
                        />
                    </div>
                    <div className="options-list">
                        {/* The Enterprise Empty State Logic */}
                        {searchQuery.trim() === '' ? (
                            <div className="no-results" style={{ padding: '24px 16px', color: '#6B7280' }}>
                                <svg style={{ display: 'block', margin: '0 auto 8px', width: '24px', height: '24px', opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                {searchHint || "Type to search..."}
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div className="no-results">No matches found.</div>
                        ) : (
                            filteredOptions.map(opt => (
                                <div 
                                    key={opt.value} 
                                    className="option-item"
                                    style={{ backgroundColor: value === opt.value ? '#F5F3FF' : '', fontWeight: value === opt.value ? '600' : 'normal', color: value === opt.value ? '#8B5CF6' : '#374151' }}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                        setSearchQuery(''); // Reset search on select
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

    // Fetch standard periods for the grid structure on mount
    useEffect(() => {
        fetch('http://localhost:8082/api/period')
            .then(res => res.json())
            .then(data => {
                const lectures = data.filter(p => p.type === 'LECTURE' || p.type === 'lecture');
                lectures.sort((a, b) => a.startTime.localeCompare(b.startTime));
                setClassPeriods(lectures);
            }).catch(err => console.error(err));
    }, []);

    // Function to open the grid
    const openAvailabilityGrid = async (id) => {
        try {
            const res = await fetch(`http://localhost:8082/api/teacher-availability/${id}`);
            setTeacherGrid(await res.json());
            setGridModalOpen(true);
        } catch(e) { console.error("Failed to load availability", e); }
    };

    // Fetch Subjects for the filter dropdown
    useEffect(() => {
        fetch('http://localhost:8082/api/subject/label').then(res => res.json()).then(setSubjects);
        fetch('http://localhost:8082/api/department').then(res => res.json()).then(setDepartments); // Fetch departments
    }, []);

    const fetchTeachers = () => {
        setLoading(true);

        // Dynamically construct URL with JPA Specification filters
        let url = `http://localhost:8082/api/teacher?sortBy=${sortBy}&sortDir=${sortDir}&page=0&size=50`;
        if (filters.gender) url += `&gender=${filters.gender}`;
        if (filters.teacherType) url += `&teacherType=${filters.teacherType}`;
        if (filters.subjectId) url += `&subjectId=${filters.subjectId}`;
        if (filters.departmentId) url += `&departmentId=${filters.departmentId}`; 

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setTeachers(data.content || data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch teachers:", err);
                setLoading(false);
            });
    };

    // Re-fetch when sort or filters change
    useEffect(() => {
        fetchTeachers();
    }, [sortBy, sortDir, filters]);

    useEffect(() => {
        if (!selectedTeacherId) {
            setTeacherDetail(null);
            return;
        }
        
        setDetailLoading(true);
        fetch(`http://localhost:8082/api/teacher/${selectedTeacherId}`)
            .then(res => res.json())
            .then(data => {
                setTeacherDetail(data);
                setDetailLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch teacher details:", err);
                setDetailLoading(false);
            });
    }, [selectedTeacherId]);

    const handleCopy = (text, fieldName) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000); 
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete teacher ${id}? This action cannot be undone.`)) {
            try {
                // 1. Use the interceptor to catch the 409 Conflict
                await apiFetch(`http://localhost:8082/api/teacher/${id}`, { method: 'DELETE' });
                
                // 2. Safely clear states upon success
                if (selectedTeacherId === id) setSelectedTeacherId(null);
                fetchTeachers();
                
            } catch (error) {
                // 3. Gracefully surface the detailed error message
                alert(`Deletion Blocked:\n\n${error.message}`);
            }
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key] === value ? '' : value // Toggle off if clicked again
        }));
    };

    const clearFilters = () => {
        setFilters({ gender: '', teacherType: '', subjectId: '', departmentId: '' });
        setIsFilterOpen(false);
    };

    const filteredTeachers = teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (teacher.subjects && teacher.subjects.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSort = (column) => {
        if (sortBy === column) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        else { setSortBy(column); setSortDir('asc'); }
    };

    const renderSortIcon = (column) => {
        if (sortBy !== column) return <span className="sort-icon inactive">↕</span>;
        return <span className="sort-icon active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="teacher-page-wrapper">
            <div className="global-action-bar">
                <div className="search-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" placeholder="Search teacher, ID, or subject..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="action-buttons">
                    {/* Filter Button */}
                    <button 
                        className={`btn-secondary filter-btn ${Object.values(filters).some(x => x !== '') ? 'active-filter' : ''}`} 
                        onClick={() => setIsFilterOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                        Filter
                        {Object.values(filters).filter(x => x !== '').length > 0 && (
                            <span className="filter-badge">{Object.values(filters).filter(x => x !== '').length}</span>
                        )}
                    </button>
                    <button className="btn-primary" onClick={onAddClick}>+ Add Teacher</button>
                </div>
            </div>

            {/* --- ADVANCED FILTER MODAL --- */}
            {isFilterOpen && (
                <div className="filter-overlay" onClick={() => setIsFilterOpen(false)}>
                    <div className="filter-modal" onClick={e => e.stopPropagation()}>
                        <div className="filter-header">
                            <h3>Advanced Filters</h3>
                            <button className="close-panel-btn" onClick={() => setIsFilterOpen(false)}>✕</button>
                        </div>
                        
                        <div className="filter-body">
                            {/* Contract Type Selection */}
                            <div className="filter-section">
                                <h4>Contract Type</h4>
                                <div className="radio-card-group">
                                    <div className={`radio-card ${filters.teacherType === 'FULL_TIME' ? 'selected' : ''}`} onClick={() => handleFilterChange('teacherType', 'FULL_TIME')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                        <span>Full-Time</span>
                                    </div>
                                    <div className={`radio-card ${filters.teacherType === 'PART_TIME' ? 'selected' : ''}`} onClick={() => handleFilterChange('teacherType', 'PART_TIME')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                        <span>Part-Time</span>
                                    </div>
                                </div>
                            </div>

                            {/* Gender Selection */}
                            <div className="filter-section">
                                <h4>Gender Identity</h4>
                                <div className="radio-card-group">
                                    <div className={`radio-card ${filters.gender === 'MALE' ? 'selected' : ''}`} onClick={() => handleFilterChange('gender', 'MALE')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M5.5 21v-2a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v2"></path></svg>
                                        <span>Male</span>
                                    </div>
                                    <div className={`radio-card ${filters.gender === 'FEMALE' ? 'selected' : ''}`} onClick={() => handleFilterChange('gender', 'FEMALE')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path><path d="M12 15v6"></path><path d="M9 18h6"></path></svg>
                                        <span>Female</span>
                                    </div>
                                </div>
                            </div>

                            {/* New Department Selection */}
                            <div className="filter-section">
                                <h4>Faculty / Department</h4>
                                <EnterpriseSearchableSelect 
                                    options={departments.map(d => ({ value: d.id, label: d.name }))}
                                    value={filters.departmentId}
                                    onChange={(val) => handleFilterChange('departmentId', val)}
                                    placeholder="All Departments"
                                    searchHint="Type department name..."
                                />
                            </div>

                            {/* Upgraded Subject Selection */}
                            <div className="filter-section">
                                <h4>Assigned Subject</h4>
                                <EnterpriseSearchableSelect 
                                    options={subjects.map(s => ({ value: s.id, label: `${s.name} (${s.subjectCode})` }))}
                                    value={filters.subjectId}
                                    onChange={(val) => handleFilterChange('subjectId', val)}
                                    placeholder="All Subjects"
                                    searchHint="Type subject name or code..."
                                />
                            </div>
                        </div>

                        <div className="filter-footer">
                            <button className="btn-secondary" onClick={clearFilters}>Clear All</button>
                            <button className="btn-primary" onClick={() => setIsFilterOpen(false)}>Apply Filters</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MAIN CONTENT (TABLE & DETAILS) --- */}
            <div className="teacher-view-container">
                <div className="table-section">
                    <div className="table-header">
                        <div>
                            <h2>Teacher Database</h2>
                            <p>Manage and view university lecturers</p>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        {loading ? (
                            <div className="loading-state">Loading database...</div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Profile</th>
                                        <th onClick={() => handleSort('id')} className="sortable">ID {renderSortIcon('id')}</th>
                                        <th onClick={() => handleSort('name')} className="sortable">Name {renderSortIcon('name')}</th>
                                        <th>Department</th>
                                        <th style={{textAlign: 'right'}}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTeachers.length === 0 ? (
                                        <tr><td colSpan="5" className="empty-state">No teachers found matching criteria.</td></tr>
                                    ) : (
                                        filteredTeachers.map(teacher => (
                                            <tr key={teacher.id} className={selectedTeacherId === teacher.id ? 'selected-row' : ''} onClick={() => setSelectedTeacherId(teacher.id)}>
                                                <td>
                                                    {teacher.profileUrl ? (
                                                        <img src={teacher.profileUrl} alt={teacher.name} className="table-avatar" />
                                                    ) : (
                                                        <div className="avatar-placeholder">{teacher.name.charAt(0)}</div>
                                                    )}
                                                </td>
                                                <td className="fw-500">{teacher.id}</td>
                                                <td className="fw-500">{teacher.name}</td>
                                                <td className="text-muted">{teacher.department || 'Unassigned'}</td>
                                                
                                                <td className="action-cell" style={{textAlign: 'right'}}>
                                                    <button className="action-icon-btn edit" title="Edit" onClick={(e) => { e.stopPropagation(); onEditClick(teacher.id); }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                    <button className="action-icon-btn delete" title="Delete" onClick={(e) => handleDelete(e, teacher.id)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {selectedTeacherId && (
                    <div className="detail-section">
                        {/* NEW: Reorganized Top Actions */}
                        <div className="detail-header-actions">
                            <button className="detail-edit-btn" onClick={() => onEditClick(teacherDetail?.id)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                Edit Profile
                            </button>
                            <button className="close-panel-btn" onClick={() => setSelectedTeacherId(null)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {detailLoading || !teacherDetail ? (
                            <div className="loading-state">Fetching profile...</div>
                        ) : (
                            <div className="detail-content">
                                <div className="detail-header">
                                    {/* NEW: Hoverable Avatar Wrapper */}
                                    <div className="detail-avatar-wrapper">
                                        {isImageUploading ? (
                                            <div className="detail-avatar-placeholder" style={{fontSize: '12px'}}>...</div>
                                        ) : teacherDetail.profileUrl ? (
                                            <img src={teacherDetail.profileUrl} alt={teacherDetail.name} className="detail-avatar" />
                                        ) : (
                                            <div className="detail-avatar-placeholder">{teacherDetail.name.charAt(0)}</div>
                                        )}
                                        
                                        {!isImageUploading && (
                                            <div className="avatar-overlay">
                                                <button className="overlay-btn" onClick={() => fileInputRef.current?.click()}>Upload</button>
                                                {teacherDetail.profileUrl && (
                                                    <button className="overlay-btn danger" onClick={handleDetailImageDelete}>Delete</button>
                                                )}
                                            </div>
                                        )}
                                        <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleDetailImageUpload} />
                                    </div>

                                    <h3>{teacherDetail.name}</h3>
                                    <span className="detail-id">{teacherDetail.id}</span>
                                </div>

                                <div className="detail-body">
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Contract Type</label>
                                            <span className={`type-badge ${teacherDetail.teacherType === 'PART_TIME' ? 'part-time' : 'full-time'}`}>
                                                {teacherDetail.teacherType === 'PART_TIME' ? 'Part-Time' : 'Full-Time'}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <label>Gender</label>
                                            <span>{teacherDetail.gender === 'MALE' ? 'Male' : 'Female'}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>NRC</label>
                                            <span>{teacherDetail.nrc}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Phone</label>
                                            <div className="copyable-field">
                                                <span>{teacherDetail.phoneContact}</span>
                                                <button className="copy-btn" onClick={() => handleCopy(teacherDetail.phoneContact, 'phone')}>
                                                    {copiedField === 'phone' ? (
                                                        <svg className="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    ) : (
                                                        <svg className="copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="info-item" style={{ gridColumn: 'span 2' }}>
                                            <label>Email</label>
                                            <div className="copyable-field">
                                                <span className="truncate">{teacherDetail.email}</span>
                                                <button className="copy-btn" onClick={() => handleCopy(teacherDetail.email, 'email')}>
                                                    {copiedField === 'email' ? (
                                                        <svg className="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    ) : (
                                                        <svg className="copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* NEW: Department gets its own full-width block directly below the grid */}
                                    <div className="info-block">
                                        <label>Department</label>
                                        <span className="full-width-info">{teacherDetail.department || 'Unassigned'}</span>
                                    </div>

                                    <div className="info-block">
                                        <label>Address</label>
                                        <span className="full-width-info">{teacherDetail.address}</span>
                                    </div>

                                    <div className="info-block">
                                        <label>Address</label>
                                        <span className="full-width-info">{teacherDetail.address}</span>
                                    </div>

                                    <div className="info-block">
                                        <h4>Assigned Subjects</h4>
                                        <div className="subject-tags">
                                            {teacherDetail.subjects && teacherDetail.subjects.length > 0 ? (
                                                teacherDetail.subjects.map(sub => (
                                                    <span key={sub.id} className="subject-tag">
                                                        {sub.name} ({sub.subjectCode})
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-muted">No subjects assigned yet.</span>
                                            )}
                                        </div>
                                    </div>

                                    {teacherDetail.teacherType === 'PART_TIME' && (
                                        <div className="info-block" style={{ marginTop: '24px' }}>
                                            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => openAvailabilityGrid(teacherDetail.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                                                View Availability Grid
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- AVAILABILITY GRID MODAL --- */}
            {gridModalOpen && (
                <div className="filter-overlay" onClick={() => setGridModalOpen(false)}>
                    <div className="grid-modal" onClick={e => e.stopPropagation()}>
                        <div className="filter-header">
                            <h3>Availability: {teacherDetail?.name}</h3>
                            <button className="close-panel-btn" onClick={() => setGridModalOpen(false)}>✕</button>
                        </div>
                        
                        <div className="grid-modal-body">
                            <div className="table-responsive">
                                <table className="availability-table">
                                    <thead>
                                        <tr>
                                            <th className="period-col-header">Period</th>
                                            {daysOfWeek.map(day => <th key={day}>{day.substring(0, 3)}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classPeriods.map(period => (
                                            <tr key={period.id}>
                                                <td className="period-label">
                                                    <div className="period-name">{period.name}</div>
                                                    <div className="period-time">{period.startTime.substring(0,5)} - {period.endTime.substring(0,5)}</div>
                                                </td>
                                                {daysOfWeek.map(day => {
                                                    const isAvailable = teacherGrid.some(s => s.dayOfWeek === day && s.classPeriodId === period.id);
                                                    return (
                                                        <td key={`${day}-${period.id}`} className={`availability-cell read-only ${isAvailable ? 'is-available' : 'is-unavailable'}`}>
                                                            {isAvailable ? '✓' : ''}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherList;