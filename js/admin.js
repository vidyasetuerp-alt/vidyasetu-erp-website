(function () {
  const PASSWORD = "Himu**1983";
  const AUTH_KEY = "vidyasetu-admin-auth";
  const keys = {
    downloads: "vidyasetu-download-count",
    leads: "vidyasetu-demo-leads",
    feedback: "vidyasetu-app-feedback",
    afterSales: "vidyasetu-after-sales-feedback"
  };

  const loginPanel = document.getElementById("adminLoginPanel");
  const dashboard = document.getElementById("adminDashboard");
  const loginForm = document.getElementById("adminLoginForm");
  const passwordInput = document.getElementById("adminPassword");
  const loginStatus = document.getElementById("adminLoginStatus");
  const logout = document.getElementById("adminLogout");

  function getJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function toCsvCell(value) {
    return `"${String(value || "").replace(/"/g, '""')}"`;
  }

  function exportCsv(filename, headers, rows) {
    const csvRows = rows.map((row) => headers.map((header) => toCsvCell(row[header])).join(","));
    const blob = new Blob([[headers.map(toCsvCell).join(","), ...csvRows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function renderRows(id, rows, columns, emptyText) {
    const body = document.getElementById(id);
    if (!body) return;
    if (!rows.length) {
      body.innerHTML = `<tr><td colspan="${columns.length}">${escapeHtml(emptyText)}</td></tr>`;
      return;
    }
    body.innerHTML = rows.map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(row[column])}</td>`).join("")}</tr>`).join("");
  }

  function appFeedbackRows(items) {
    return items.map((item) => ({
      Date: item.submittedAt,
      School: item.school,
      Contact: item.contactPerson,
      Designation: item.designation,
      Mobile: item.mobile,
      Email: item.email,
      Students: item.students,
      Rating: item.overallRating,
      Feedback: item.customerFeedback,
      "Future Features": item.futureFeatures
    }));
  }

  function afterSalesRows(items) {
    return items.map((item) => ({
      Date: item.submittedAt,
      School: item.school,
      Contact: item.contactPerson,
      Designation: item.role,
      Mobile: item.mobile,
      Service: item.serviceArea,
      Rating: item.rating,
      Feedback: item.comment,
      Improvement: item.improvement
    }));
  }

  function leadRows(items) {
    return items.map((item) => ({
      Date: item.submittedAt,
      School: item.schoolName,
      Contact: item.contactPerson,
      Mobile: item.mobile,
      Email: item.email,
      City: item.city,
      Students: item.students,
      Message: item.message
    }));
  }

  function renderDashboard() {
    const leads = getJson(keys.leads);
    const feedback = getJson(keys.feedback);
    const afterSales = getJson(keys.afterSales);
    const downloads = Number(localStorage.getItem(keys.downloads) || 0);

    setText("adminDownloadCount", downloads.toString());
    setText("adminLeadCount", leads.length.toString());
    setText("adminAppFeedbackCount", feedback.length.toString());
    setText("adminAfterSalesCount", afterSales.length.toString());

    renderRows("adminLeadRows", leadRows(leads), ["Date", "School", "Contact", "Mobile", "Email", "City", "Students", "Message"], "No demo requests saved.");
    renderRows("adminAppFeedbackRows", appFeedbackRows(feedback), ["Date", "School", "Contact", "Designation", "Mobile", "Email", "Students", "Rating", "Feedback", "Future Features"], "No app feedback saved.");
    renderRows("adminAfterSalesRows", afterSalesRows(afterSales), ["Date", "School", "Contact", "Designation", "Mobile", "Service", "Rating", "Feedback", "Improvement"], "No after-sales feedback saved.");
  }

  function showDashboard() {
    loginPanel.hidden = true;
    dashboard.hidden = false;
    renderDashboard();
  }

  if (sessionStorage.getItem(AUTH_KEY) === "1") {
    showDashboard();
  }

  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (passwordInput.value === PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      loginStatus.textContent = "";
      showDashboard();
      return;
    }
    loginStatus.textContent = "Incorrect password.";
    passwordInput.select();
  });

  logout?.addEventListener("click", () => {
    sessionStorage.removeItem(AUTH_KEY);
    dashboard.hidden = true;
    loginPanel.hidden = false;
    passwordInput.value = "";
    passwordInput.focus();
  });

  document.querySelectorAll("[data-export]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.export;
      if (type === "leads") {
        const rows = leadRows(getJson(keys.leads));
        exportCsv("vidyasetu-demo-requests.csv", ["Date", "School", "Contact", "Mobile", "Email", "City", "Students", "Message"], rows);
      }
      if (type === "appFeedback") {
        const rows = appFeedbackRows(getJson(keys.feedback));
        exportCsv("vidyasetu-app-feedback.csv", ["Date", "School", "Contact", "Designation", "Mobile", "Email", "Students", "Rating", "Feedback", "Future Features"], rows);
      }
      if (type === "afterSales") {
        const rows = afterSalesRows(getJson(keys.afterSales));
        exportCsv("vidyasetu-after-sales-feedback.csv", ["Date", "School", "Contact", "Designation", "Mobile", "Service", "Rating", "Feedback", "Improvement"], rows);
      }
    });
  });
})();
