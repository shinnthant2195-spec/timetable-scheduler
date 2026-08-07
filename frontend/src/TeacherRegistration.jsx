import React, { useState, useEffect, useRef } from 'react';
import './TeacherRegistration.css';

const TeacherRegistration = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    
    // Lookups
    const [subjects, setSubjects] = useState([]);
    const [classPeriods, setClassPeriods] = useState([]);
    const [departments, setDepartments] = useState([]); // NEW STATE
    const [searchQuery, setSearchQuery] = useState('');
    
    // Dropdown states
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
    const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    
    const searchInputRef = useRef(null);
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    
    const [formData, setFormData] = useState({
        id: '', name: '', gender: 'MALE', nrc: '', teacherType: 'FULL_TIME', 
        phoneContact: '', email: '', address: '', subjectIds: [], profileImage: null,
        department: '' // NEW FIELD
    });

    const [availableSlots, setAvailableSlots] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [formErrors, setFormErrors] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    
    useEffect(() => {
        fetch('http://localhost:8080/api/subject/label').then(res => res.json()).then(setSubjects);
        fetch('http://localhost:8080/api/department').then(res => res.json()).then(setDepartments); // NEW FETCH
        
        fetch('http://localhost:8080/api/period')
            .then(res => res.json())
            .then(data => {
                const lectures = data.filter(p => p.type === 'LECTURE' || p.type === 'lecture');
                lectures.sort((a, b) => a.startTime.localeCompare(b.startTime));
                setClassPeriods(lectures);
            });
    }, []);

    useEffect(() => {
        if (isSubjectDropdownOpen && searchInputRef.current) searchInputRef.current.focus();
    }, [isSubjectDropdownOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors('');
    };

    const validateStep = () => {
        setFormErrors('');
        if (currentStep === 1) {
            if (!formData.id.trim()) return "Teacher ID is required.";
            if (!formData.name.trim()) return "Full Name is required.";
            if (!formData.nrc.trim()) return "NRC is required.";
        } else if (currentStep === 2) {
            if (!formData.phoneContact.trim()) return "Phone Number is required.";
            if (!formData.email.trim()) return "Email Address is required.";
            if (!formData.address.trim()) return "Residential Address is required.";
        } else if (currentStep === 3) {
            if (formData.subjectIds.length === 0) return "Please select at least one subject.";
        } else if (currentStep === 4) {
            // Optional: You can enforce at least 1 available slot here if desired.
        }
        return null;
    };

    const handleNextStep = () => {
        const error = validateStep();
        if (error) setFormErrors(error);
        else setCurrentStep(prev => prev + 1);
    };

    // Image Upload Handlers
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleImageSelection(e.dataTransfer.files[0]); };
    const handleImageChange = (e) => handleImageSelection(e.target.files[0]);

    const handleImageSelection = (file) => {
        if (file && file.type.startsWith('image/')) {
            setFormData(prev => ({ ...prev, profileImage: file }));
            setImagePreview(URL.createObjectURL(file));
            setFormErrors('');
        } else {
            setFormErrors("Please upload a valid image file.");
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, profileImage: null }));
        setImagePreview(null);
    };

    const toggleSubject = (subjectId) => {
        setFormData(prev => {
            const isSelected = prev.subjectIds.includes(subjectId);
            if (isSelected) return { ...prev, subjectIds: prev.subjectIds.filter(id => id !== subjectId) };
            else return { ...prev, subjectIds: [...prev.subjectIds, subjectId] };
        });
        setFormErrors('');
    };

    const toggleAvailability = (day, periodId) => {
        setAvailableSlots(prev => {
            const exists = prev.some(s => s.dayOfWeek === day && s.classPeriodId === periodId);
            if (exists) {
                return prev.filter(s => !(s.dayOfWeek === day && s.classPeriodId === periodId));
            } else {
                return [...prev, { dayOfWeek: day, classPeriodId: periodId }];
            }
        });
    };

    const filteredSubjects = subjects.filter(sub => 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async () => {
        const error = validateStep();
        if (error) { setFormErrors(error); return; }

        setIsSubmitting(true); // Disable button

        try {
            // 1. Create Teacher
            const teacherPayload = {
                id: formData.id, name: formData.name, gender: formData.gender,
                nrc: formData.nrc, teacherType: formData.teacherType,
                phoneContact: formData.phoneContact, email: formData.email,
                address: formData.address, subjectIds: formData.subjectIds,
                department: formData.department ? parseInt(formData.department) : null, // NEW APPEND
                profileUrl: ''
            };

            const response = await fetch('http://localhost:8080/api/teacher/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teacherPayload)
            });
            if (!response.ok) throw new Error("Failed to save teacher info");

            // 2. Upload Profile Image
            if (formData.profileImage) {
                const imgData = new FormData();
                imgData.append('file', formData.profileImage);
                await fetch(`http://localhost:8080/api/teacher/${formData.id}/upload-img`, {
                    method: 'POST',
                    body: imgData
                });
            }

            // 3. Save Availability Grid (New)
            if (availableSlots.length > 0) {
                const availResponse = await fetch(`http://localhost:8080/api/teacher-availability/${formData.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(availableSlots)
                });
                if (!availResponse.ok) throw new Error("Teacher saved, but availability sync failed.");
            }

            alert("Teacher registered successfully!");
            if (onComplete) onComplete();
            
        } catch (error) {
            console.error(error);
            setFormErrors("An error occurred during registration. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h2>Register a Teacher</h2>
                <p>Fill in the details to create a new teacher profile</p>
            </div>

            {/* Stepper upgraded to 4 steps */}
            <div className="stepper">
                <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
                <div className={`line ${currentStep >= 2 ? 'active' : ''}`}></div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
                <div className={`line ${currentStep >= 3 ? 'active' : ''}`}></div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
                <div className={`line ${currentStep >= 4 ? 'active' : ''}`}></div>
                <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4</div>
            </div>

            <div className="form-card">
                {formErrors && <div className="error-banner">{formErrors}</div>}

                {/* --- Step 1: Personal Info --- */}
                {currentStep === 1 && (
                    <div className="step-content">
                        <h3>Personal Information</h3>
                        <p className="sub-title">Tell us about the teacher's identity</p>

                        <div className="avatar-upload-section">
                            <div className={`square-upload-box ${isDragging ? 'dragging' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                                {imagePreview ? (
                                    <div className="image-preview-container">
                                        <img src={imagePreview} alt="Preview" className="img-preview" />
                                        <button className="remove-img-btn" onClick={removeImage}>✕</button>
                                    </div>
                                ) : (
                                    <>
                                        <input type="file" id="file-upload" accept="image/*" onChange={handleImageChange} hidden />
                                        <label htmlFor="file-upload" className="upload-label">
                                            <span className="plus-icon">+</span>
                                            <p>Upload Photo</p>
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="row">
                            <div className="input-group">
                                <label>Teacher ID *</label>
                                <input type="text" name="id" placeholder="e.g... TCH-001" value={formData.id} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label>Full Name *</label>
                                <input type="text" name="name" placeholder="e.g... U Kyaw" value={formData.name} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="row">
                            <div className="input-group">
                                <label>Gender *</label>
                                <div className="custom-dropdown-container" onMouseLeave={() => setIsGenderDropdownOpen(false)}>
                                    <div className="select-box" onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}>
                                        {formData.gender === 'MALE' ? 'Male' : 'Female'}
                                        <span className="arrow">▼</span>
                                    </div>
                                    {isGenderDropdownOpen && (
                                        <div className="dropdown-menu">
                                            <div className="option-item" onClick={() => { setFormData(prev => ({...prev, gender: 'MALE'})); setIsGenderDropdownOpen(false); }}>Male</div>
                                            <div className="option-item" onClick={() => { setFormData(prev => ({...prev, gender: 'FEMALE'})); setIsGenderDropdownOpen(false); }}>Female</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Contract Type *</label>
                                <div className="custom-dropdown-container" onMouseLeave={() => setIsTypeDropdownOpen(false)}>
                                    <div className="select-box" onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}>
                                        {formData.teacherType === 'FULL_TIME' ? 'Full-Time' : 'Part-Time'}
                                        <span className="arrow">▼</span>
                                    </div>
                                    {isTypeDropdownOpen && (
                                        <div className="dropdown-menu">
                                            <div className="option-item" onClick={() => { setFormData(prev => ({...prev, teacherType: 'FULL_TIME'})); setIsTypeDropdownOpen(false); }}>Full-Time</div>
                                            <div className="option-item" onClick={() => { setFormData(prev => ({...prev, teacherType: 'PART_TIME'})); setIsTypeDropdownOpen(false); }}>Part-Time</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="input-group">
                            <label>NRC *</label>
                            <input type="text" name="nrc" placeholder="e.g... 12/AhSaNa(N)123456" value={formData.nrc} onChange={handleInputChange} />
                        </div>
                    </div>
                )}

                {/* --- Step 2: Contact Info --- */}
                {currentStep === 2 && (
                    <div className="step-content">
                        <h3>Contact Information</h3>
                        <p className="sub-title">How can the university reach them?</p>
                        <div className="row">
                            <div className="input-group">
                                <label>Phone Number *</label>
                                <input type="text" name="phoneContact" placeholder="09..." value={formData.phoneContact} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label>Email Address *</label>
                                <input type="email" name="email" placeholder="teacher@uni.edu" value={formData.email} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Residential Address *</label>
                            <input type="text" name="address" placeholder="123 Main St, Township..." value={formData.address} onChange={handleInputChange} />
                        </div>
                    </div>
                )}

                {/* --- Step 3: Subjects --- */}
                {currentStep === 3 && (
                    <div className="step-content">
                        <h3>Academic Assignment</h3>
                        <p className="sub-title">Assign subjects to this teacher</p>
                        
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
                            <label>Assign Subjects *</label>
                            <div className="custom-dropdown-container" onMouseLeave={() => setIsSubjectDropdownOpen(false)}>
                                <div className="select-box" onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}>
                                    {formData.subjectIds.length === 0 ? "Select subjects..." : `${formData.subjectIds.length} subject(s) selected`}
                                    <span className="arrow">▼</span>
                                </div>
                                {isSubjectDropdownOpen && (
                                    <div className="dropdown-menu dropdown-menu-large">
                                        <div className="search-wrapper">
                                            <input type="text" className="search-subject" placeholder="Type to search subjects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} ref={searchInputRef}/>
                                        </div>
                                        <div className="options-list">
                                            {filteredSubjects.length > 0 ? (
                                                filteredSubjects.map(sub => (
                                                    <label key={sub.id} className="option-item checkbox-item">
                                                        <input type="checkbox" checked={formData.subjectIds.includes(sub.id)} onChange={() => toggleSubject(sub.id)}/>
                                                        <span>{sub.name}</span>
                                                    </label>
                                                ))
                                            ) : (
                                                <div className="no-results">No subjects found.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Step 4: Availability Grid (NEW) --- */}
                {currentStep === 4 && (() => {
                    const isFullTime = formData.teacherType === 'FULL_TIME';

                    return (
                        <div className="step-content">
                            <h3>Availability Schedule</h3>
                            <p className="sub-title">Set the teacher's available teaching hours</p>

                            {isFullTime && (
                                <div className="full-time-notice">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                    <div>
                                        <strong>Full-Time Availability Active</strong>
                                        <p>Full-time faculty are mathematically considered available for all standard instructional blocks. Custom availability mapping is only required for Part-Time staff.</p>
                                    </div>
                                </div>
                            )}

                            {!isFullTime && (
                                <div className="availability-legend">
                                    <span className="legend-item"><div className="legend-box available"></div> Available</span>
                                    <span className="legend-item"><div className="legend-box unavailable"></div> Unavailable</span>
                                </div>
                            )}

                            <div className="table-responsive">
                                <table className="availability-table">
                                    <thead>
                                        <tr>
                                            <th className="period-col-header">Period</th>
                                            {daysOfWeek.map(day => <th key={day}>{day.substring(0, 3)}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classPeriods.length === 0 ? (
                                            <tr><td colSpan="6" className="no-periods">No lecture periods configured.</td></tr>
                                        ) : (
                                            classPeriods.map(period => (
                                                <tr key={period.id}>
                                                    <td className="period-label">
                                                        <div className="period-name">{period.name}</div>
                                                        <div className="period-time">{period.startTime.substring(0,5)} - {period.endTime.substring(0,5)}</div>
                                                    </td>
                                                    {daysOfWeek.map(day => {
                                                        // If FullTime, override to true. Otherwise check state.
                                                        const isAvailable = isFullTime || availableSlots.some(s => s.dayOfWeek === day && s.classPeriodId === period.id);
                                                        const canEdit = !isFullTime;

                                                        return (
                                                            <td 
                                                                key={`${day}-${period.id}`}
                                                                className={`availability-cell ${isAvailable ? 'is-available' : 'is-unavailable'} ${!canEdit ? 'disabled' : ''}`}
                                                                onClick={() => { if (canEdit) toggleAvailability(day, period.id); }}
                                                                title={isAvailable ? 'Available' : 'Unavailable'}
                                                            >
                                                                {isAvailable ? '✓' : ''}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })()}
            </div>

            <div className="form-actions">
                <button className="btn-secondary" onClick={() => { setFormErrors(''); setCurrentStep(prev => prev - 1); }} disabled={currentStep === 1 || isSubmitting}>  Previous</button>
                {currentStep < 4 ? (
                    <button className="btn-primary" onClick={handleNextStep}>Next  </button>
                ) : (
                    <button className="btn-primary submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : 'Complete Registration'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TeacherRegistration;