// ========================================
// CONFIGURATION
// ========================================
const API_BASE_URL = 'https://aegisher-backend.onrender.com';

// ========================================
// UTILITY FUNCTIONS
// ========================================
function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

// ========================================
// NAVIGATION - Smooth Scrolling
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile menu toggle (if you have one)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Initialize all features
    initSafetyReports();
    initTrustedCircle();
    initSOS();
    initSafeRoutes();
    initDangerPrediction();
});

// ========================================
// SAFETY REPORTS (Enhanced)
// ========================================
function initSafetyReports() {
    const form = document.getElementById('safety-report-form');
    if (form) {
        form.addEventListener('submit', submitSafetyReport);
    }
    loadSafetyReports();
}

async function submitSafetyReport(e) {
    e.preventDefault();
    
    const type = document.getElementById('incident-type').value;
    const location = document.getElementById('location').value;
    const description = document.getElementById('description').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/safety-reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type,
                location,
                description,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            showMessage('report-message', 'Report submitted successfully!', 'success');
            e.target.reset();
            loadSafetyReports(); // Refresh the list
        } else {
            throw new Error('Failed to submit report');
        }
    } catch (error) {
        console.error('Error submitting report:', error);
        showMessage('report-message', 'Failed to submit report. Please try again.', 'error');
    }
}

async function loadSafetyReports() {
    const listContainer = document.getElementById('reports-list');
    if (!listContainer) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/safety-reports`);
        const reports = await response.json();
        
        if (reports.length === 0) {
            listContainer.innerHTML = '<p class="placeholder-text">No reports yet. Be the first to report!</p>';
            return;
        }
        
        listContainer.innerHTML = reports.map(report => `
            <div class="report-item">
                <p><strong>${report.type || 'Incident'}</strong></p>
                <p>📍 ${report.location}</p>
                <p>${report.description}</p>
                <p style="font-size: 0.9rem; color: #999;">
                    ${new Date(report.timestamp || report.createdAt).toLocaleString()}
                </p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading reports:', error);
        listContainer.innerHTML = '<p class="error">Failed to load reports.</p>';
    }
}

// ========================================
// TRUSTED CIRCLE
// ========================================
function initTrustedCircle() {
    const form = document.getElementById('trusted-circle-form');
    if (form) {
        form.addEventListener('submit', addTrustedContact);
    }
    loadTrustedContacts();
}

async function addTrustedContact(e) {
    e.preventDefault();
    
    const name = document.getElementById('contact-name').value;
    const phone = document.getElementById('contact-phone').value;
    const email = document.getElementById('contact-email').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/trusted-circle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                phone,
                email: email || undefined
            })
        });
        
        if (response.ok) {
            showMessage('trusted-circle-message', 'Contact added successfully!', 'success');
            e.target.reset();
            loadTrustedContacts();
        } else {
            throw new Error('Failed to add contact');
        }
    } catch (error) {
        console.error('Error adding contact:', error);
        showMessage('trusted-circle-message', 'Failed to add contact. Please try again.', 'error');
    }
}

async function loadTrustedContacts() {
    const listContainer = document.getElementById('trusted-contacts-list');
    if (!listContainer) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/trusted-circle`);
        const contacts = await response.json();
        
        if (contacts.length === 0) {
            listContainer.innerHTML = '<p class="placeholder-text">No trusted contacts yet. Add someone you trust!</p>';
            return;
        }
        
        listContainer.innerHTML = contacts.map(contact => `
            <div class="contact-item">
                <div class="contact-info">
                    <h4>${contact.name}</h4>
                    <p>📱 ${contact.phone}</p>
                    ${contact.email ? `<p>✉️ ${contact.email}</p>` : ''}
                </div>
                <button class="btn-delete" onclick="deleteTrustedContact('${contact._id || contact.id}')">
                    Remove
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading contacts:', error);
        listContainer.innerHTML = '<p class="error">Failed to load contacts.</p>';
    }
}

async function deleteTrustedContact(contactId) {
    if (!confirm('Remove this contact from your trusted circle?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/trusted-circle/${contactId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadTrustedContacts();
        } else {
            throw new Error('Failed to delete contact');
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Failed to remove contact. Please try again.');
    }
}

// ========================================
// SOS EMERGENCY ALERT
// ========================================
function initSOS() {
    const sosButton = document.getElementById('sos-button');
    if (!sosButton) return;
    
    let holdTimer;
    let holdDuration = 0;
    const HOLD_DURATION = 3000; // 3 seconds hold
    
    sosButton.addEventListener('mousedown', startSOSHold);
    sosButton.addEventListener('mouseup', cancelSOSHold);
    sosButton.addEventListener('mouseleave', cancelSOSHold);
    sosButton.addEventListener('touchstart', startSOSHold);
    sosButton.addEventListener('touchend', cancelSOSHold);
    
    function startSOSHold(e) {
        e.preventDefault();
        holdDuration = 0;
        sosButton.classList.add('active');
        
        holdTimer = setInterval(() => {
            holdDuration += 100;
            if (holdDuration >= HOLD_DURATION) {
                triggerSOS();
                cancelSOSHold();
            }
        }, 100);
    }
    
    function cancelSOSHold() {
        clearInterval(holdTimer);
        sosButton.classList.remove('active');
        holdDuration = 0;
    }
}

async function triggerSOS() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/sos/trigger`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        latitude,
                        longitude,
                        address: 'User current location',
                        triggerMethod: 'manual'
                    })
                });
                
                if (response.ok) {
                    showMessage('sos-message', '🚨 Emergency alert sent to your trusted contacts!', 'success');
                } else {
                    throw new Error('Failed to send SOS');
                }
            } catch (error) {
                console.error('Error sending SOS:', error);
                showMessage('sos-message', 'Failed to send alert. Please call emergency services directly.', 'error');
            }
        }, (error) => {
            console.error('Geolocation error:', error);
            showMessage('sos-message', 'Could not get your location. Please enable location services.', 'error');
        });
    } else {
        showMessage('sos-message', 'Geolocation not supported by your browser.', 'error');
    }
}

// ========================================
// SAFE ROUTES
// ========================================
function initSafeRoutes() {
    const form = document.getElementById('safe-routes-form');
    if (form) {
        form.addEventListener('submit', findSafeRoute);
    }
}

async function findSafeRoute(e) {
    e.preventDefault();
    
    const from = document.getElementById('route-from').value;
    const to = document.getElementById('route-to').value;
    const resultContainer = document.getElementById('route-result');
    
    resultContainer.innerHTML = '<p class="loading">Calculating safest route...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/routes/safe-route`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from,
                to
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayRouteResult(data);
            showMessage('route-message', 'Route calculated successfully!', 'success');
        } else {
            throw new Error(data.message || 'Failed to calculate route');
        }
    } catch (error) {
        console.error('Error finding route:', error);
        resultContainer.innerHTML = '<p class="error">Failed to calculate route. Please try again.</p>';
        showMessage('route-message', 'Failed to find route. Please try again.', 'error');
    }
}

function displayRouteResult(data) {
    const resultContainer = document.getElementById('route-result');
    
    const safetyLevel = data.safetyScore >= 80 ? 'high' : 
                       data.safetyScore >= 50 ? 'medium' : 'low';
    
    resultContainer.innerHTML = `
        <div class="route-info">
            <h4>Route Details</h4>
            <p><strong>From:</strong> ${data.from}</p>
            <p><strong>To:</strong> ${data.to}</p>
            <p><strong>Distance:</strong> ${data.distance || 'Calculating...'}</p>
            <p><strong>Estimated Time:</strong> ${data.duration || 'Calculating...'}</p>
            <span class="safety-badge ${safetyLevel}">
                Safety Score: ${data.safetyScore || 'N/A'}%
            </span>
        </div>
        ${data.warnings && data.warnings.length > 0 ? `
            <div class="route-info">
                <h4>⚠️ Safety Warnings</h4>
                <ul>
                    ${data.warnings.map(w => `<li>${w}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        <div class="route-info">
            <h4>📍 Route Instructions</h4>
            <p>${data.instructions || 'Follow the safest path shown on the map.'}</p>
        </div>
    `;
}

// ========================================
// DANGER PREDICTION
// ========================================
function initDangerPrediction() {
    const form = document.getElementById('danger-prediction-form');
    if (form) {
        form.addEventListener('submit', analyzeDangerZone);
    }
}

async function analyzeDangerZone(e) {
    e.preventDefault();
    
    const location = document.getElementById('prediction-location').value;
    const time = document.getElementById('prediction-time').value;
    const resultContainer = document.getElementById('prediction-result');
    
    resultContainer.innerHTML = '<p class="loading">Analyzing safety data...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/danger-prediction/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                location,
                timeOfDay: time || undefined
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayPredictionResult(data);
        } else {
            throw new Error(data.message || 'Failed to analyze location');
        }
    } catch (error) {
        console.error('Error analyzing danger zone:', error);
        resultContainer.innerHTML = '<p class="error">Failed to analyze location. Please try again.</p>';
    }
}

function displayPredictionResult(data) {
    const resultContainer = document.getElementById('prediction-result');
    
    const riskLevel = data.riskScore <= 30 ? 'low' : 
                     data.riskScore <= 70 ? 'medium' : 'high';
    
    const riskText = riskLevel === 'low' ? 'Low Risk' :
                    riskLevel === 'medium' ? 'Medium Risk' : 'High Risk';
    
    resultContainer.innerHTML = `
        <div class="risk-score">
            <h4>Safety Analysis for</h4>
            <p style="font-size: 1.1rem; color: #667eea;">${data.location}</p>
            <div class="risk-level ${riskLevel}">${riskText}</div>
            <p style="color: #666;">Risk Score: ${data.riskScore}/100</p>
        </div>
        
        ${data.factors && data.factors.length > 0 ? `
            <div class="risk-factors">
                <h5>Risk Factors Detected</h5>
                <ul>
                    ${data.factors.map(factor => `<li>• ${factor}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        
        ${data.recommendations && data.recommendations.length > 0 ? `
            <div class="risk-factors">
                <h5>Safety Recommendations</h5>
                <ul>
                    ${data.recommendations.map(rec => `<li>✓ ${rec}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        
        <div class="risk-factors">
            <p style="color: #999; font-size: 0.9rem; text-align: center; margin-top: 15px;">
                Analysis based on community reports and historical data
            </p>
        </div>
    `;
}