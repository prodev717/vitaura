/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export default function Home() {
  const [formData, setFormData] = useState({
    image: null,
    description: '',
    location: '',
    zone: '',
    landmark: '',
    pincode: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeTab, setActiveTab] = useState('submit');
  const [userComplaints, setUserComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [complaintId, setComplaintId] = useState(null);

  const formRef = useRef(null);
  const sidebarRef = useRef(null);

  // Get user email from localStorage
  const userEmail = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(formRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        delay: 0.2,
      });

      if (sidebarRef.current) {
        gsap.from(sidebarRef.current, {
          x: 30,
          opacity: 0,
          duration: 0.6,
          delay: 0.4,
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // Fetch user complaints when switching to track tab
  useEffect(() => {
    if (activeTab === 'track' && userEmail) {
      fetchUserComplaints();
    }
  }, [activeTab, userEmail]);

  const fetchUserComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/complaints/${userEmail}`);
      const data = await response.json();
      
      if (data.success) {
        setUserComplaints(data.complaints);
      } else {
        setError('Failed to fetch complaints');
      }
    } catch (err) {
      setError('Error fetching complaints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userEmail) {
      alert('Please set your email in localStorage first');
      return;
    }

    if (!formData.image) {
      alert('Please upload an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(formData.image);

      reader.onload = async () => {
        const base64Image = reader.result.split(',')[1]; // Remove data URL prefix

        const payload = {
          email: userEmail,
          image_base64: base64Image,
          description: formData.description,
          location: formData.landmark,
          pincode: formData.pincode,
          zone: formData.zone
        };

        try {
          const response = await fetch('http://localhost:8000/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });

          const data = await response.json();

          if (response.ok && data.success) {
            setComplaintId(data.complaint_id);
            setShowSubmitModal(true);
            
            // Reset form after 2 seconds
            setTimeout(() => {
              setFormData({
                image: null,
                description: '',
                location: '',
                zone: '',
                landmark: '',
                pincode: ''
              });
              setImagePreview(null);
            }, 2000);
          } else {
            setError(data.error || 'Failed to submit complaint');
            alert('Error: ' + (data.error || 'Unknown error'));
          }
        } catch (err) {
          setError('Network error. Please try again.');
          alert('Error: ' + err.message);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read image');
        setLoading(false);
      };
    } catch (err) {
      setError('Error processing image');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  const getPriorityColor = (priority) => {
    if (priority >= 8) return 'bg-red-100 text-red-700';
    if (priority >= 5) return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900 border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-lg shadow-md flex items-center justify-center">
                <svg className="w-9 h-9 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Civic Complaint Portal</h1>
                <p className="text-sm text-blue-200">Department of Public Services</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{userEmail || 'Guest'}</div>
                  <div className="text-xs text-blue-200">Citizen</div>
                </div>
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center font-bold shadow-lg">
                  {userEmail ? userEmail[0].toUpperCase() : 'G'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div ref={formRef} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 bg-linear-to-r from-gray-50 to-gray-100">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('submit')}
                    className={`relative px-6 py-4 text-sm font-semibold transition-all duration-300 ${
                      activeTab === 'submit' 
                        ? 'text-blue-700 bg-white' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {activeTab === 'submit' && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-blue-600 to-indigo-600" />
                    )}
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Submit New Complaint
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('track')}
                    className={`relative px-6 py-4 text-sm font-semibold transition-all duration-300 ${
                      activeTab === 'track' 
                        ? 'text-blue-700 bg-white' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {activeTab === 'track' && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-blue-600 to-indigo-600" />
                    )}
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Track Complaints
                    </div>
                  </button>
                </div>
              </div>

              {activeTab === 'submit' ? (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Complaint Registration</h3>
                      <p className="text-sm text-gray-600">Fields marked with <span className="text-red-600 font-semibold">*</span> are mandatory</p>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Upload Photograph <span className="text-red-600">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        required
                      />
                      <label
                        htmlFor="image-upload"
                        className="block cursor-pointer border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-all duration-300 bg-linear-to-br from-gray-50 to-blue-50 group-hover:from-blue-50 group-hover:to-indigo-50"
                      >
                        {imagePreview ? (
                          <div className="relative p-4">
                            <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setImagePreview(null);
                                setFormData({ ...formData, image: null });
                              }}
                              className="mt-3 text-sm text-blue-700 hover:text-blue-900 font-semibold underline"
                            >
                              Remove & Change Image
                            </button>
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-gray-700 font-semibold mb-1">Click to upload image</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Zone Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Zone Category <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-300 bg-white cursor-pointer"
                    >
                      <option value="">-- Select Zone Category --</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial / Business">Commercial / Business</option>
                      <option value="Educational">Educational</option>
                      <option value="Healthcare / Emergency">Healthcare / Emergency</option>
                      <option value="Industrial / Manufacturing">Industrial / Manufacturing</option>
                      <option value="Government / Administrative">Government / Administrative</option>
                      <option value="Transport / Traffic Corridors">Transport / Traffic Corridors</option>
                      <option value="Recreational / Public Spaces">Recreational / Public Spaces</option>
                      <option value="Tourist / Cultural">Tourist / Cultural</option>
                    </select>
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Landmark / Specific Location <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={formData.landmark}
                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                        required
                        className="w-full pl-11 pr-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                        placeholder="E.g., Near City Mall, Main St & 5th Ave"
                      />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Pincode <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      pattern="[0-9]{6}"
                      maxLength="6"
                      required
                      className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                      placeholder="6-digit pincode"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Complaint Description <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                      className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all duration-300 resize-none"
                      placeholder="Provide detailed description of the issue"
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-r-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm text-blue-900 font-semibold mb-1">Important Information</p>
                        <p className="text-sm text-blue-800">
                          Your complaint will be automatically classified and routed to the appropriate department. You'll receive updates via SMS and email.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-700 rounded-lg" />
                      <div className="absolute inset-0 bg-linear-to-r from-indigo-700 to-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative flex items-center justify-center gap-2 py-3 text-white font-semibold">
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Submit Complaint
                          </>
                        )}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ image: null, description: '', location: '', zone: '', landmark: '', pincode: '' });
                        setImagePreview(null);
                        setError('');
                      }}
                      className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors border border-gray-300"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Your Complaints</h3>
                    <button 
                      onClick={fetchUserComplaints}
                      className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <svg className="animate-spin h-8 w-8 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="mt-2 text-gray-600">Loading complaints...</p>
                    </div>
                  ) : userComplaints.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600">No complaints found</p>
                      <p className="text-sm text-gray-500 mt-1">Submit your first complaint to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userComplaints.map((report) => (
                        <div key={report.serial_no} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                                {report.serial_no}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">{report.issue_type || 'Pending Analysis'}</h4>
                                <p className="text-sm text-gray-600">{report.location}</p>
                                <p className="text-xs text-gray-500 mt-1">Dept: {report.department || 'Not Assigned'}</p>
                              </div>
                            </div>
                            {report.priority && (
                              <span className={`px-3 py-1 text-xs font-bold rounded-full ${getPriorityColor(report.priority)}`}>
                                Priority: {report.priority}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${getStatusColor(report.status)}`}>
                                {report.status.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-500">{formatDate(report.datetime)}</span>
                              {report.confidence && (
                                <span className="text-xs text-gray-500">
                                  Confidence: {(report.confidence * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div ref={sidebarRef} className="space-y-5">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2.5 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Guidelines
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Helpdesk
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View FAQs
                </button>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-linear-to-br from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-r-xl shadow-md p-5">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-amber-900 mb-1">Important Notice</h3>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Response times vary based on complaint severity. Emergency issues receive priority attention automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Helpdesk Contact */}
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-5 text-white">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Helpdesk Contact
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <div>
                    <p className="text-blue-100 text-xs">Toll-Free</p>
                    <p className="font-semibold">1800-XXX-XXXX</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <div>
                    <p className="text-blue-100 text-xs">Email Support</p>
                    <p className="font-semibold text-sm">support@civic.gov.in</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <p className="text-blue-100 text-xs">Hours: Mon-Sat, 9 AM - 6 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-12 py-6 border-t-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2025 Department of Public Services. All Rights Reserved.</p>
          <p className="text-xs text-gray-500 mt-2">Best viewed in Chrome, Firefox, Safari (Latest versions) | Screen Resolution 1024x768 or higher</p>
        </div>
      </footer>

      {/* Success Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-t-4 border-green-500">
            <div className="text-center">
              <div className="w-20 h-20 bg-linear-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Complaint Registered!</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-900 font-semibold">
                  Complaint ID: <span className="text-green-700">CR{complaintId}</span>
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Your complaint has been successfully registered and forwarded to the concerned department. You will receive updates via SMS and email.
              </p>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setActiveTab('track');
                }}
                className="w-full px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                View My Complaints
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}