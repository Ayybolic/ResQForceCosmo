// src/components/ClientPage.jsx (Auto-sets severity to 'high' if description is empty)
import React, { useState, useEffect } from 'react'; // No change needed
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'; // No change needed
import apiClient from '../api/axiosConfig'; // No change needed

// styles object (Unchanged)
const styles = { 
    body: { fontFamily: "'Space Grotesk', sans-serif", backgroundColor: '#1a202c', color: '#e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' },
    mapContainer: { height: '300px', width: '100%', maxWidth: '800px', marginBottom: '20px', borderRadius: '15px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.4)' },
    reportBox: { width: '100%', maxWidth: '600px', padding: '30px', background: '#111', color: '#fff', borderRadius: '15px', boxShadow: '0 0 15px rgba(0, 0, 0, 0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    title: { fontSize: '28px', color: '#2eccff', marginBottom: '15px', fontFamily: "'Orbitron', sans-serif", textAlign: 'center' },
    disclaimer: { fontSize: '14px', color: '#ccc', marginBottom: '25px', lineHeight: '1.5', textAlign: 'center' },
    inputBase: { width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #3498db', background: '#1e1e1e', color: 'white', fontSize: '16px', boxSizing: 'border-box' },
    textArea: { resize: 'vertical', minHeight: '100px' },
    severityGroup: { display: 'flex', justifyContent: 'space-around', gap: '10px', marginBottom: '20px', width: '100%' },
    severityButton: { flexGrow: 1, padding: '12px', borderRadius: '8px', border: '2px solid transparent', backgroundColor: '#374151', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease-in-out' },
    submitButton: { padding: '12px 24px', backgroundColor: '#e74c3c', border: 'none', borderRadius: '8px', color: 'white', fontSize: '18px', cursor: 'pointer', transition: 'background 0.3s', width: '100%', fontFamily: "'Orbitron', sans-serif" },
    messageBox: { marginTop: '20px', padding: '15px', borderRadius: '8px', fontSize: '16px', textAlign: 'center', width: '100%', boxSizing: 'border-box' },
    success: { backgroundColor: '#10b981', color: 'white' },
    error: { backgroundColor: '#ef4444', color: 'white' },
};

// MapUpdater component (Unchanged)
const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

function ClientPage() {
    // State variables
    const [tag, setTag] = useState('fire');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState('medium'); // Default is 'medium'
    const [mobileNumber, setMobileNumber] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [mapState, setMapState] = useState({ position: [20.5937, 78.9629], zoom: 5 });
    const [reportedLocation, setReportedLocation] = useState(null);

    // displayMessage function (Unchanged)
    const displayMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    // --- REPLACED: handleSubmit function with offline logic ---
    const handleSubmit = (event) => {
        event.preventDefault();

        // Validations (Description check removed)
        // if (!description.trim()) { displayMessage('Please describe the emergency.', 'error'); return; } // <-- THIS LINE IS REMOVED
        if (!mobileNumber.trim()) { displayMessage('Please enter a mobile number.', 'error'); return; }
        if (!/^\d{10}$/.test(mobileNumber)) { displayMessage('Please enter a valid 10-digit mobile number.', 'error'); return; }

        if (!navigator.geolocation) {
            displayMessage("Geolocation not supported.", 'error'); return;
        }

        displayMessage("Getting location...", "info");
        console.log("Requesting geolocation..."); // <-- Log 1

        navigator.geolocation.getCurrentPosition(
            // Success Callback (Location OK)
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                console.log("Geolocation successful:", lat, lng); // <-- Log 2

                // --- NEW LOGIC ADDED ---
                // If description is empty (or just spaces), force severity to 'high'
                const finalSeverity = !description.trim() ? 'high' : severity;
                if (finalSeverity === 'high' && severity !== 'high') {
                    console.log("Description empty, auto-setting severity to 'high'.");
                }
                // --- END NEW LOGIC ---

                // --- MODIFIED ---
                const reportData = { lat, lng, description, tag, severity: finalSeverity, timestamp: new Date().toISOString() };
                const isOnline = navigator.onLine; // <-- Check status
                // --- END MODIFICATION ---

                console.log("Network status check. Is online:", isOnline); // <-- Log 3

                if (isOnline) {
                    // ONLINE PATH
                    console.log("Attempting to send report online..."); // <-- Log 4
                    displayMessage("Sending report...", "info");
                    try {
                        await apiClient.post('/report_emergency', reportData);
                        console.log("Online report sent successfully."); // <-- Log 5
                        displayMessage('Emergency reported successfully!', 'success');
                        // Reset form
                        setMapState({ position: [lat, lng], zoom: 15 });
                        setReportedLocation([lat, lng]);