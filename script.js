const API_URL = "https://aegisher-backend.onrender.com/api";

// 🟢 Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// 🟢 Fade-in Animation
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".feature-card, .step").forEach(el => {
  el.style.opacity = "0";
  el.style.transform = "translateY(30px)";
  el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
  observer.observe(el);
});

// 🟢 Check Backend Connection
async function checkBackend() {
  try {
    const latitude = 28.6139; // Example: New Delhi
    const longitude = 77.2090;

    const res = await fetch(`${API_URL}/safety-reports/nearby?latitude=${latitude}&longitude=${longitude}&radius=5000`);
    const data = await res.json();

    if (res.ok && data.success) {
      console.log("✅ Backend is connected!");
      console.log(`📍 Found ${data.count} safety reports.`);
      console.log(`⭐ Average Safety Rating: ${data.averageSafetyRating}`);
    } else {
      console.log("⚠️ Backend reachable but returned an error:", data.error || res.status);
    }
  } catch (err) {
    console.error("❌ Cannot reach backend:", err);
  }
}
checkBackend();

// 🟢 Load Safety Reports
async function loadSafetyReports() {
  try {
    const latitude = 28.6139;
    const longitude = 77.2090;

    const res = await fetch(`${API_URL}/safety-reports/nearby?latitude=${latitude}&longitude=${longitude}`);
    const data = await res.json();

    const container = document.getElementById("reports-list");
    if (!container) return;

    container.innerHTML = "";

    if (!data.success) {
      container.innerHTML = `<p>⚠️ Failed to load safety reports: ${data.error || "Unknown error"}</p>`;
      return;
    }

    if (data.count === 0) {
      container.innerHTML = "<p>No safety reports found nearby.</p>";
      return;
    }

    data.reports.forEach(report => {
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
loadSafetyReports();

// 🟢 Submit Safety Report
document.addEventListener("DOMContentLoaded", () => {
  const reportForm = document.getElementById("reportForm");
  const responseMessage = document.getElementById("responseMessage");

  if (!reportForm) return; // safety check

  reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const placeName = document.getElementById("placeName").value;
    const safetyRating = parseInt(document.getElementById("safetyRating").value);
    const reportType = document.getElementById("reportType").value;
    const comment = document.getElementById("comment").value;
    const timeOfDay = document.getElementById("timeOfDay").value;

    const payload = {
      latitude: 28.6139,  // example coords (Delhi)
      longitude: 77.2090,
      safetyRating,
      placeName,
      reportType,
      comment,
      timeOfDay
    };

    try {
      const res = await fetch(`${API_URL}/safety-reports/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        responseMessage.style.color = "green";
        responseMessage.textContent = "✅ Report submitted successfully!";
        console.log("✅ Report created:", data);

        reportForm.reset();
        loadSafetyReports(); // refresh list
      } else {
        responseMessage.style.color = "red";
        responseMessage.textContent = `⚠️ Error: ${data.error || "Submission failed"}`;
        console.error("⚠️ Error submitting:", data);
      }
    } catch (err) {
      responseMessage.style.color = "red";
      responseMessage.textContent = "❌ Network error while submitting report";
      console.error("❌ Submission failed:", err);
    }
  });
});