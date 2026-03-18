import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/drafts');
      setDrafts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post('http://localhost:5000/api/admin/drafts/approve', { id });
      setDrafts(drafts.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post('http://localhost:5000/api/admin/drafts/reject', { id });
      setDrafts(drafts.filter(d => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading drafts...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <ShieldCheck className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Verification Dashboard</h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden text-left">
        <div className="bg-gray-50 p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-500" />
            Pending AI Drafts ({drafts.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">Review scraped job data before publishing to the Knowledge Graph.</p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {drafts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No pending drafts to review.</div>
          ) : (
            drafts.map(draft => (
              <div key={draft.id} className="p-6 transition hover:bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-indigo-900">{draft.title}</h3>
                    <p className="text-sm text-gray-600">{draft.company} • {draft.location}</p>
                    <p className="text-sm text-gray-500 mt-1">Status: <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs ml-1">{draft.status}</span></p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleReject(draft.id)}
                      className="px-4 py-2 flex items-center text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition"
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(draft.id)}
                      className="px-4 py-2 flex items-center text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve & Publish
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Parsed Skills</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {draft.required_skills?.map((skill, idx) => (
                      <span key={idx} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700"><strong>Estimated Salary:</strong> ₹{draft.salary_est?.toLocaleString()}</p>
                  <p className="text-sm text-gray-700"><strong>Source:</strong> {draft.source}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
