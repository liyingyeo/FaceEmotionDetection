import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import PieChart from './PieChart.js';
import {API_URL} from './Config.js';

const APP_URL = API_URL; // API base URL

function Profile() {
  const [profiles, setProfiles] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editId, setEditId] = useState(null); // For editing profiles
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 5;

  const [selectedProfile, setSelectedProfile] = useState(null); // Selected profile for showing details

  useEffect(() => {
    fetchProfiles();
  }, [currentPage, search]);

  // Fetch profiles from the API
  const fetchProfiles = async () => {
    const response = await fetch(`${APP_URL}/profiles?page=${currentPage}&per_page=${perPage}&search=${search}`);
    const data = await response.json();
    setProfiles(data.profiles);
    setTotalPages(data.pages);
  };

  // Open the profile detail in a fixed area when a username is clicked
  const showProfileDetails = (profile) => {
    setSelectedProfile(profile);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="container mt-5">

      {/* Profile Detail Area */}
      {selectedProfile ? (
        <div className="card mb-4">
          <div className="card-body">
            <div style={{float: 'left', width:'300px', textAlign: 'left'}}>
              <div>
              <h5 className="card-title">Profile Details</h5>
              <p><strong>Name:</strong> {selectedProfile.name}</p>
              <p><strong>Gender:</strong> {selectedProfile.gender}</p>
              <p><strong>Age:</strong> {selectedProfile.age}</p>
              <p><strong>Email:</strong> {selectedProfile.email}</p>
              <p><strong>Remark:</strong> {selectedProfile.remark}</p>
              </div>
            </div>
            <div><PieChart profileName={selectedProfile.name}></PieChart></div>
          </div>
        
        </div>
      ) : (
        <div className="alert alert-info mb-4">
          <p>Select a profile to view details</p>
        </div>
      )}

      {/* Search Input */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search profiles by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List of profiles */}
      <ul className="list-group mt-3">
        {profiles.map((profile) => (
          <li key={profile.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              {/* Username as clickable text, displays profile details in fixed area */}
              <span
                onClick={() => showProfileDetails(profile)}
                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
              >
                <strong>{profile.name}</strong>
              </span>
              - {profile.email}
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <nav className="mt-3">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
          </li>
          {[...Array(totalPages).keys()].map((_, i) => (
            <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Profile;


