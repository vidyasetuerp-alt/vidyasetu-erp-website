(function () {
  const html = document.documentElement;
  const nav = document.getElementById("siteNav");
  const themeToggle = document.getElementById("themeToggle");
  const backToTop = document.getElementById("backToTop");
  const form = document.querySelector(".lead-form");
  const formStatus = document.getElementById("formStatus");
  const feedbackForm = document.querySelector(".feedback-form");
  const feedbackStatus = document.getElementById("feedbackStatus");
  const softwareDownload = document.getElementById("softwareDownload");
  const downloadCount = document.getElementById("downloadCount");
  const adminDownloadStats = document.getElementById("adminDownloadStats");
  const adminLeads = document.getElementById("admin-leads");
  const adminFeedback = document.getElementById("admin-feedback");
  const leadCount = document.getElementById("leadCount");
  const leadTableBody = document.getElementById("leadTableBody");
  const exportLeads = document.getElementById("exportLeads");
  const clearLeads = document.getElementById("clearLeads");
  const feedbackCount = document.getElementById("feedbackCount");
  const feedbackTableBody = document.getElementById("feedbackTableBody");
  const exportFeedback = document.getElementById("exportFeedback");
  const exportFeedbackXlsx = document.getElementById("exportFeedbackXlsx");
  const clearFeedback = document.getElementById("clearFeedback");
  const downloadCountKey = "vidyasetu-download-count";
  const leadsKey = "vidyasetu-demo-leads";
  const feedbackKey = "vidyasetu-app-feedback";
  const isAdminView = new URLSearchParams(window.location.search).get("admin") === "1";
  const evaluationModules = [
    ["schoolManagement", "School Management"],
    ["admissionManagement", "Admission Management"],
    ["feesManagement", "Fees Management"],
    ["attendanceManagement", "Attendance Management"],
    ["examinationResult", "Examination & Result"],
    ["employeeTeacherManagement", "Employee/Teacher Management"],
    ["userInterface", "User Interface"],
    ["overallExperience", "Overall Experience"]
  ];

  const savedTheme = localStorage.getItem("vidyasetu-theme");
  if (savedTheme) {
    html.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    themeToggle.innerHTML = theme === "dark" ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>';
  }

  themeToggle?.addEventListener("click", () => {
    const nextTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", nextTheme);
    localStorage.setItem("vidyasetu-theme", nextTheme);
    updateThemeIcon(nextTheme);
  });

  function onScroll() {
    const scrolled = window.scrollY > 18;
    nav?.classList.toggle("scrolled", scrolled);
    backToTop?.classList.toggle("visible", window.scrollY > 500);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelectorAll(".navbar a[href^='#'], .footer a[href^='#']").forEach((link) => {
    link.addEventListener("click", () => {
      const menu = document.getElementById("mainMenu");
      if (menu?.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  const counters = document.querySelectorAll(".counter");
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      const target = Number(counter.dataset.target || 0);
      const duration = 1200;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        counter.textContent = Math.floor(progress * target).toString();
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      counterObserver.unobserve(counter);
    });
  }, { threshold: 0.6 });

  counters.forEach((counter) => counterObserver.observe(counter));

  function renderDownloadCount() {
    if (!downloadCount) return;
    downloadCount.textContent = Number(localStorage.getItem(downloadCountKey) || 0).toString();
  }

  if (isAdminView) {
    adminDownloadStats?.classList.add("visible");
    adminLeads?.classList.add("visible");
    adminFeedback?.classList.add("visible");
  }

  renderDownloadCount();

  softwareDownload?.addEventListener("click", () => {
    const nextCount = Number(localStorage.getItem(downloadCountKey) || 0) + 1;
    localStorage.setItem(downloadCountKey, nextCount.toString());
    renderDownloadCount();
  });

  function getLeads() {
    try {
      return JSON.parse(localStorage.getItem(leadsKey) || "[]");
    } catch {
      return [];
    }
  }

  function saveLeads(leads) {
    localStorage.setItem(leadsKey, JSON.stringify(leads));
  }

  function getFeedback() {
    try {
      return JSON.parse(localStorage.getItem(feedbackKey) || "[]");
    } catch {
      return [];
    }
  }

  function saveFeedback(feedbackItems) {
    localStorage.setItem(feedbackKey, JSON.stringify(feedbackItems));
  }

  function getCheckedValue(name) {
    return feedbackForm?.querySelector(`input[name="${name}"]:checked`)?.value || "";
  }

  function getCheckedValues(name) {
    return [...(feedbackForm?.querySelectorAll(`input[name="${name}"]:checked`) || [])].map((item) => item.value);
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

  function renderLeads() {
    const leads = getLeads();
    if (leadCount) leadCount.textContent = leads.length.toString();
    if (!leadTableBody) return;

    if (!leads.length) {
      leadTableBody.innerHTML = '<tr><td colspan="8">No demo requests saved yet.</td></tr>';
      return;
    }

    leadTableBody.innerHTML = leads.map((lead) => `
      <tr>
        <td>${escapeHtml(lead.submittedAt)}</td>
        <td>${escapeHtml(lead.schoolName)}</td>
        <td>${escapeHtml(lead.contactPerson)}</td>
        <td>${escapeHtml(lead.mobile)}</td>
        <td>${escapeHtml(lead.email)}</td>
        <td>${escapeHtml(lead.city)}</td>
        <td>${escapeHtml(lead.students)}</td>
        <td>${escapeHtml(lead.message)}</td>
      </tr>
    `).join("");
  }

  function renderFeedback() {
    const feedbackItems = getFeedback();
    if (feedbackCount) feedbackCount.textContent = feedbackItems.length.toString();
    if (!feedbackTableBody) return;

    if (!feedbackItems.length) {
      feedbackTableBody.innerHTML = '<tr><td colspan="12">No app feedback saved yet.</td></tr>';
      return;
    }

    feedbackTableBody.innerHTML = feedbackItems.map((item) => `
      <tr>
        <td>${escapeHtml(item.submittedAt)}</td>
        <td>${escapeHtml(item.school)}</td>
        <td>${escapeHtml(item.contactPerson)}</td>
        <td>${escapeHtml(item.designation)}</td>
        <td>${escapeHtml(item.mobile)}</td>
        <td>${escapeHtml(item.email)}</td>
        <td>${escapeHtml(item.students)}</td>
        <td>${escapeHtml(evaluationModules.map(([key, label]) => `${label}: ${item.evaluation?.[key] || ""}`).join(" | "))}</td>
        <td>${escapeHtml([...(item.importantModules || []), item.importantModulesOther].filter(Boolean).join(", "))}</td>
        <td>${escapeHtml([item.recordsManagement, item.recordsManagementOther].filter(Boolean).join(" - "))}</td>
        <td>${escapeHtml(item.purchaseIntent)}</td>
        <td>${escapeHtml(item.overallRating)}</td>
        <td>${escapeHtml(item.futureFeatures)}</td>
      </tr>
    `).join("");
  }

  function getFeedbackExportRows() {
    return getFeedback().map((item) => {
      const row = {
        Date: item.submittedAt,
        School: item.school,
        Contact: item.contactPerson,
        Designation: item.designation,
        Mobile: item.mobile,
        Email: item.email,
        Students: item.students
      };
      evaluationModules.forEach(([key, label]) => {
        row[label] = item.evaluation?.[key] || "";
      });
      row["Important Modules"] = [...(item.importantModules || []), item.importantModulesOther].filter(Boolean).join(", ");
      row["Current Records Management"] = [item.recordsManagement, item.recordsManagementOther].filter(Boolean).join(" - ");
      row["Purchase Interest"] = item.purchaseIntent;
      row["Overall Rating"] = item.overallRating;
      row["Future Features"] = item.futureFeatures;
      return row;
    });
  }

  function getFeedbackExportHeaders() {
    return [
      "Date",
      "School",
      "Contact",
      "Designation",
      "Mobile",
      "Email",
      "Students",
      ...evaluationModules.map(([, label]) => label),
      "Important Modules",
      "Current Records Management",
      "Purchase Interest",
      "Overall Rating",
      "Future Features"
    ];
  }

  function toCsvCell(value) {
    return `"${String(value || "").replace(/"/g, '""')}"`;
  }

  exportLeads?.addEventListener("click", () => {
    const leads = getLeads();
    const headers = ["Date", "School", "Contact", "Mobile", "Email", "City", "Students", "Message"];
    const rows = leads.map((lead) => [
      lead.submittedAt,
      lead.schoolName,
      lead.contactPerson,
      lead.mobile,
      lead.email,
      lead.city,
      lead.students,
      lead.message
    ].map(toCsvCell).join(","));
    const csv = [headers.map(toCsvCell).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vidyasetu-demo-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  exportFeedback?.addEventListener("click", () => {
    const exportRows = getFeedbackExportRows();
    const headers = getFeedbackExportHeaders();
    const rows = exportRows.map((row) => headers.map((header) => toCsvCell(row[header])).join(","));
    const csv = [headers.map(toCsvCell).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vidyasetu-app-feedback.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  exportFeedbackXlsx?.addEventListener("click", () => {
    if (!window.XLSX) {
      feedbackStatus.textContent = "XLSX export library is still loading. Please try again, or use CSV export.";
      return;
    }
    const rows = getFeedbackExportRows();
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: getFeedbackExportHeaders() });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback");
    XLSX.writeFile(workbook, "vidyasetu-app-feedback.xlsx");
  });

  clearLeads?.addEventListener("click", () => {
    if (!window.confirm("Clear all saved demo requests on this device?")) return;
    saveLeads([]);
    renderLeads();
  });

  clearFeedback?.addEventListener("click", () => {
    if (!window.confirm("Clear all saved app feedback on this device?")) return;
    saveFeedback([]);
    renderFeedback();
  });

  renderLeads();
  renderFeedback();

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const lead = {
      submittedAt: new Date().toLocaleString("en-IN"),
      schoolName: document.getElementById("schoolName")?.value.trim(),
      contactPerson: document.getElementById("personName")?.value.trim(),
      mobile: document.getElementById("mobile")?.value.trim(),
      email: document.getElementById("email")?.value.trim(),
      city: document.getElementById("city")?.value.trim(),
      students: document.getElementById("students")?.value.trim(),
      message: document.getElementById("message")?.value.trim()
    };
    const leads = getLeads();
    leads.unshift(lead);
    saveLeads(leads);
    renderLeads();
    formStatus.textContent = "Thank you. Your demo request has been saved. Our team will contact you soon.";
    form.reset();
  });

  feedbackForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const feedback = {
      submittedAt: new Date().toLocaleString("en-IN"),
      school: document.getElementById("feedbackSchool")?.value.trim(),
      contactPerson: document.getElementById("feedbackContact")?.value.trim(),
      designation: document.getElementById("feedbackDesignation")?.value.trim(),
      mobile: document.getElementById("feedbackMobile")?.value.trim(),
      email: document.getElementById("feedbackEmail")?.value.trim(),
      students: document.getElementById("feedbackStudents")?.value.trim(),
      evaluation: {
        schoolManagement: getCheckedValue("evalSchoolManagement"),
        admissionManagement: getCheckedValue("evalAdmissionManagement"),
        feesManagement: getCheckedValue("evalFeesManagement"),
        attendanceManagement: getCheckedValue("evalAttendanceManagement"),
        examinationResult: getCheckedValue("evalExaminationResult"),
        employeeTeacherManagement: getCheckedValue("evalEmployeeTeacherManagement"),
        userInterface: getCheckedValue("evalUserInterface"),
        overallExperience: getCheckedValue("evalOverallExperience")
      },
      importantModules: getCheckedValues("importantModules"),
      importantModulesOther: document.getElementById("importantModulesOther")?.value.trim(),
      recordsManagement: getCheckedValue("recordsManagement"),
      recordsManagementOther: document.getElementById("recordsManagementOther")?.value.trim(),
      purchaseIntent: getCheckedValue("purchaseIntent"),
      overallRating: getCheckedValue("overallRating"),
      futureFeatures: document.getElementById("futureFeatures")?.value.trim()
    };
    const feedbackItems = getFeedback();
    feedbackItems.unshift(feedback);
    saveFeedback(feedbackItems);
    renderFeedback();
    feedbackStatus.textContent = "Thank you. Your feedback has been saved for the VidyaSetu ERP team.";
    feedbackForm.reset();
  });
})();
