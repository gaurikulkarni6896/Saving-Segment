

import React, { useState } from 'react';

const DEFAULT_WEBHOOK_URL = '	https://webhook.site/df98d926-c19c-42a7-af34-47b08d8a82c8'; 

const ALL_OPTIONS = [
  { label: 'First Name', value: 'first_name' },
  { label: 'Last Name', value: 'last_name' },
  { label: 'Gender', value: 'gender' },
  { label: 'Age', value: 'age' },
  { label: 'Account Name', value: 'account_name' },
  { label: 'City', value: 'city' },
  { label: 'State', value: 'state' },
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [segmentName, setSegmentName] = useState('');
  const [mainSelect, setMainSelect] = useState('');
  const [schemas, setSchemas] = useState([]); 
  const [status, setStatus] = useState(null);

  function openModal() {
    setIsOpen(true);
    setStatus(null);
  }
  function closeModal() {
    setIsOpen(false);
    setSegmentName('');
    setMainSelect('');
    setSchemas([]);
    setStatus(null);
  }

  const usedValues = schemas.map(s => s.value).filter(Boolean);

  function handleAddSchema(e) {
    e.preventDefault();
    if (!mainSelect) return;
   
    if (usedValues.includes(mainSelect)) {
      setStatus({ type: 'error', message: 'Schema already added.' });
      return;
    }
    setSchemas(prev => [...prev, { id: Date.now() + Math.random(), value: mainSelect }]);
    setMainSelect('');
    setStatus(null);
  }

  function handleSchemaChange(id, newValue) {
    setSchemas(prev => prev.map(s => (s.id === id ? { ...s, value: newValue } : s)));
  }

  function handleRemoveSchema(id) {
    setSchemas(prev => prev.filter(s => s.id !== id));
  }

  async function handleSaveSegment() {
    if (!segmentName) {
      setStatus({ type: 'error', message: 'Please enter a segment name.' });
      return;
    }
    if (schemas.length === 0) {
      setStatus({ type: 'error', message: 'Add at least one schema.' });
      return;
    }

    const payload = {
      segment_name: segmentName,
      schema: schemas.map(s => {
        const opt = ALL_OPTIONS.find(o => o.value === s.value);
        return { [s.value]: opt ? opt.label : s.value };
      }),
    };

    try {
      setStatus({ type: 'pending', message: 'Sending...' });
      const res = await fetch(DEFAULT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setStatus({ type: 'success', message: 'Segment saved — payload sent to webhook.' });
    } catch (err) {
      setStatus({ type: 'error', message: `Failed to send: ${err.message}` });
    }
  }

  function availableOptionsForDropdown(currentId) {
  
    const otherSelected = schemas.filter(s => s.id !== currentId).map(s => s.value);
    return ALL_OPTIONS.filter(o => !otherSelected.includes(o.value));
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6">
      <div className="w-full max-w-2xl">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">CustomerLabs — Segment Builder</h1>
          <button
            onClick={openModal}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          >
            Save segment
          </button>
        </header>

        <main className="bg-white p-6 rounded shadow">
          <p className="text-gray-600">Click "Save segment" to create a new segment.</p>
          <ul className="mt-4 list-disc ml-5 text-sm text-gray-700">
            <li>Segments let you group users by schema fields.</li>
            <li>Open the modal to add schema fields and save (payload sent to webhook.site).</li>
          </ul>
        </main>

        {/* Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={closeModal}></div>
            <div className="relative w-full max-w-2xl mx-4">
              <div className="bg-white rounded shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-medium">Save Segment</h2>
                    <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Segment Name</label>
                      <input
                        type="text"
                        value={segmentName}
                        onChange={e => setSegmentName(e.target.value)}
                        placeholder="e.g. last_10_days_blog_visits"
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-blue-200 p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Add schema to segment</label>
                      <div className="flex items-center gap-3 mt-1">
                        <select
                          value={mainSelect}
                          onChange={e => setMainSelect(e.target.value)}
                          className="flex-1 rounded border-gray-300 p-2"
                        >
                          <option value="">-- Select schema --</option>
                          {ALL_OPTIONS.filter(o => !usedValues.includes(o.value)).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>

                        <button
                          onClick={handleAddSchema}
                          className="text-blue-600 underline text-sm"
                        >
                          +Add new schema
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Selected schemas</label>
                      <div className="bg-blue-50 border border-blue-100 rounded p-4 space-y-3">
                        {schemas.length === 0 && (
                          <div className="text-sm text-gray-500">No schemas added yet.</div>
                        )}

                        {schemas.map(s => (
                          <div key={s.id} className="flex items-center gap-3">
                            <select
                              value={s.value}
                              onChange={e => handleSchemaChange(s.id, e.target.value)}
                              className="flex-1 rounded border-gray-300 p-2"
                            >
                              {availableOptionsForDropdown(s.id).map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleRemoveSchema(s.id)}
                              className="text-red-600 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {status && (
                      <div className={`text-sm ${status.type === 'error' ? 'text-red-600' : status.type === 'success' ? 'text-green-600' : 'text-gray-700'}`}>
                        {status.message}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button onClick={closeModal} className="px-3 py-2 rounded border">Cancel</button>
                      <button
                        onClick={handleSaveSegment}
                        className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        Save segment
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
