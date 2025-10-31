const API_URL = "http://localhost:5001/api";
// Smooth scrolling
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

// Fade-in animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});
async function checkBackend() {
  try {
    // Example location (Los Angeles coordinates)
    const latitude = 34.0522;
    const longitude = -118.2437;

    const res = await fetch(`${API_URL}/safety-reports/nearby?latitude=${latitude}&longitude=${longitude}&radius=5000`);
    const data = await res.json();

    if (res.ok && data.success) {
      console.log(`✅ Backend is connected!`);
      console.log(`📍 Found ${data.count} safety reports.`);
      console.log(`⭐ Average Safety Rating: ${data.averageSafetyRating}`);
    } else {
      console.log("⚠️ Backend reachable but returned an error:", data.error || res.status);
    }
  } catch (err) {
    console.error("❌ Cannot reach backend:", err);
  }
}

checkBackend(); // Run this once on page load

// ====================
// Load and Display Safety Reports
// ====================

async function loadSafetyReports() {
  try {
    const latitude = 34.0522; // Example: Downtown LA
    const longitude = -118.2437;

    const res = await fetch(
      `${API_URL}/safety-reports/nearby?latitude=${latitude}&longitude=${longitude}`
    );
    const data = await res.json();

    if (!data.success) {
      console.error("⚠️ Failed to load safety reports:", data);
      return;
    }

    const container = document.getElementById("reports-list");
    container.innerHTML = ""; // Clear old reports

    if (data.count === 0) {
      container.innerHTML = "<p>No safety reports found nearby.</p>";
      return;
    }

    data.reports.forEach((report) => {
      const card = document.createElement("div");
      card.className = "feature-card";
      card.innerHTML = `
        <div class="feature-icon">📍</div>
        <h3>${report.placeName || "Unnamed Location"}</h3>
        <p><strong>Type:</strong> ${report.reportType}</p>
        <p><strong>Rating:</strong> ${report.safetyRating}/5</p>
        <p><strong>Comment:</strong> ${report.comment}</p>
        <p><strong>Time:</strong> ${new Date(report.createdAt).toLocaleString()}</p>
      `;
      container.appendChild(card);
    });

    console.log(`✅ Loaded ${data.count} safety reports`);
  } catch (err) {
    console.error("❌ Error loading reports:", err);
  }
}

loadSafetyReports(); // Run once on page load