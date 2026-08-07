import React, { useState, useEffect, useRef } from 'react';
import './TeacherRegistration.css'; // Reuses your clean form styling

const TeacherEditForm = ({ teacherId, onComplete, onCancel }) => {
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]); // NEW STATE
    const [searchQuery, setSearchQuery] = useState('');
    const [formErrors, setFormErrors] = useState('');
    
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
    const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    
    const searchInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '', 
        gender: 'MALE', 
        nrc: '', 
        teacherType: 'FULL_TIME',
        phoneContact: '', 
        email: '', 
        address: '', 
        subjectIds: [],
        department: '' // NEW FIELD
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8080/api/subject/label').then(res => res.json()).then(setSubjects);
        fetch('http://localhost:8080/api/department').then(res => res.json()).then(setDepartments); // NEW FETCH
        
        fetch(`http://localhost:8080/api/teacher/${teacherId}`)
            .then(res => res.json())
            .then(data => {
                setFormData({
                    name: data.name, gender: data.gender, nrc: data.nrc,
                    teacherType: data.teacherType, phoneContact: data.phoneContact,
                    email: data.email, address: data.address,
                    subjectIds: data.subjects ? data.subjects.map(s => s.id) : [],
                    department: data.department || '' // Pre-fill department name? Wait, backend needs ID.
                });
                // Note: If data.department returns a string name, we need to map it to an ID. 
                // A better approach is matching the string to the department list ID once departments are loaded.
                setLoading(false);
            })
            .catch(err => { console.error(err); setFormErrors("Failed to load profile."); setLoading(false); });
    }, [teacherId]);

    useEffect(() => {
        if (departments.length > 0 && typeof formData.department === 'string' && isNaN(formData.department)) {
            const matchedDept = departments.find(d => d.name === formData.department);
            if (matchedDept) {
                setFormData(prev => ({ ...prev, department: matchedDept.id }));
            } else {
                setFormData(prev => ({ ...prev, department: '' }));
            }
        }
    }, [departments, loading]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleSubject = (subjectId) => {
        setFormData(prev => {
            if (prev.subjectIds.includes(subjectId)) {
                return { ...prev, subjectIds: prev.subjectIds.filter(id => id !== subjectId) };
            }
            return { ...prev, subjectIds: [...prev.subjectIds, subjectId] };
        });
    };

    const filteredSubjects = subjects.filter(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                name: formData.name, gender: formData.gender, nrc: formData.nrc,
                teacherType: formData.teacherType, phoneContact: formData.phoneContact,
                email: formData.email, address: formData.address, subjectIds: formData.subjectIds,
                department: formData.department ? parseInt(formData.department) : null // ADD THIS
            };
            
            const response = await fetch(`http://localhost:8080/api/teacher/${teacherId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Update failed");
            
            alert("Teacher updated successfully!");
            onComplete();
        } catch (error) { 
            console.error(error);
            setFormErrors("Failed to update teacher data.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Loading Editor...</div>;

    return (
        <div className="form-container">
            <div className="form-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <h2>Edit Profile: {teacherId}</h2>
                    <p>Modify existing information for this staff member</p>
                </div>
                <button className="btn-secondary" onClick={onCancel}>✕ Cancel</button>
            </div>

            <div className="form-card" style={{minHeight: 'auto'}}>
                {formErrors && <div className="error-banner">{formErrors}</div>}

                <div className="row">
                    <div className="input-group">
                        <label>Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div className="input-group">
                        <label>NRC *</label>
                        <input type="text" name="nrc" value={formData.nrc} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="row">
                    <div className="input-group">
                        <label>Gender</label>
                        <div className="custom-dropdown-container" onMouseLeave={() => setIsGenderDropdownOpen(false)}>
                            <div className="select-box" onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}>
                                {formData.gender === 'MALE' ? 'Male' : 'Female'}
                                <span className="arrow">▼</span>
                            </div>
                            {isGenderDropdownOpen && (
                                <div className="dropdown-menu">
                                    <div className="option-item" onClick={() => { setFormData({...formData, gender: 'MALE'}); setIsGenderDropdownOpen(false); }}>Male</div>
                                    <div className="option-item" onClick={() => { setFormData({...formData, gender: 'FEMALE'}); setIsGenderDropdownOpen(false); }}>Female</div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Contract Type</label>
                        <div className="custom-dropdown-container" onMouseLeave={() => setIsTypeDropdownOpen(false)}>
                            <div className="select-box" onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}>
                                {formData.teacherType === 'FULL_TIME' ? 'Full-Time' : 'Part-Time'}
                                <span className="arrow">▼</span>
                            </div>
                            {isTypeDropdownOpen && (
                                <div className="dropdown-menu">
                                    <div className="option-item" onClick={() => { setFormData({...formData, teacherType: 'FULL_TIME'}); setIsTypeDropdownOpen(false); }}>Full-Time</div>
                                    <div className="option-item" onClick={() => { setFormData({...formData, teacherType: 'PART_TIME'}); setIsTypeDropdownOpen(false); }}>Part-Time</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="input-group">
                        <label>Phone Contact</label>
                        <input type="text" name="phoneContact" value={formData.phoneContact} onChange={handleInputChange} />
                    </div>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="input-group">
                    <label>Residential Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                </div>

                <div className="input-group">
                    <label>Assigned Department</label>
                    <select className="enterprise-input" style={{ padding: '12px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', outline: 'none' }} name="department" value={formData.department} onChange={handleInputChange}>
                        <option value="">-- No Department Assigned --</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label>Assigned Subjects</label>
                    <div className="custom-dropdown-container" onMouseLeave={() => setIsSubjectDropdownOpen(false)}>
                        <div className="select-box" onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}>
                            {formData.subjectIds.length === 0 ? "Select subjects..." : `${formData.subjectIds.length} subject(s) selected`}
                            <span className="arrow">▼</span>
                        </div>
                        {isSubjectDropdownOpen && (
                            <div className="dropdown-menu dropdown-menu-large">
                                <div className="search-wrapper">
                                    <input type="text" className="search-subject" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} ref={searchInputRef}/>
                                </div>
                                <div className="options-list">
                                    {filteredSubjects.map(sub => (
                                        <label key={sub.id} className="option-item checkbox-item">
                                            <input type="checkbox" checked={formData.subjectIds.includes(sub.id)} onChange={() => toggleSubject(sub.id)}/>
                                            <span>{sub.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-actions" style={{marginTop: '32px', justifyContent: 'flex-end'}}>
                    <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherEditForm;