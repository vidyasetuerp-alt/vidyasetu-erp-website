(function () {
  const html = document.documentElement;
  const nav = document.getElementById("siteNav");
  const themeToggle = document.getElementById("themeToggle");
  const backToTop = document.getElementById("backToTop");
  const form = document.querySelector(".lead-form");
  const formStatus = document.getElementById("formStatus");
  const feedbackForm = document.querySelector(".feedback-form");
  const feedbackStatus = document.getElementById("feedbackStatus");
  const afterSalesForm = document.querySelector(".after-sales-form");
  const afterSalesStatus = document.getElementById("afterSalesStatus");
  const schoolLoginForm = document.getElementById("schoolLoginForm");
  const schoolLoginStatus = document.getElementById("schoolLoginStatus");
  const schoolCreateForm = document.getElementById("schoolCreateForm");
  const schoolCreateStatus = document.getElementById("schoolCreateStatus");
  const schoolAccountPanel = document.getElementById("schoolAccountPanel");
  const schoolActivationForm = document.getElementById("schoolActivationForm");
  const schoolActivationFormStatus = document.getElementById("schoolActivationFormStatus");
  const schoolActivationStatus = document.getElementById("schoolActivationStatus");
  const schoolActivationKey = document.getElementById("schoolActivationKey");
  const schoolActivationDate = document.getElementById("schoolActivationDate");
  const schoolExpiryDate = document.getElementById("schoolExpiryDate");
  const schoolAdminNote = document.getElementById("schoolAdminNote");
  const schoolLogout = document.getElementById("schoolLogout");
  const schoolDashboardPage = document.getElementById("schoolDashboardPage");
  const portalLicenseCapacity = document.getElementById("portalLicenseCapacity");
  const portalLicenseDuration = document.getElementById("portalLicenseDuration");
  const portalActualPrice = document.getElementById("portalActualPrice");
  const portalDiscountPrice = document.getElementById("portalDiscountPrice");
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
  const publishedAfterSalesCount = document.getElementById("publishedAfterSalesCount");
  const publishedAfterSalesList = document.getElementById("publishedAfterSalesList");
  const exportFeedback = document.getElementById("exportFeedback");
  const exportFeedbackXlsx = document.getElementById("exportFeedbackXlsx");
  const clearFeedback = document.getElementById("clearFeedback");
  const downloadCountKey = "vidyasetu-download-count";
  const leadsKey = "vidyasetu-demo-leads";
  const feedbackKey = "vidyasetu-app-feedback";
  const afterSalesKey = "vidyasetu-after-sales-feedback";
  const schoolAccountsKey = "vidyasetu-school-accounts";
  const schoolActivationUpdatesKey = "vidyasetu-school-activation-updates";
  const schoolSessionKey = "vidyasetu-school-session";
  const schoolApiModeKey = "vidyasetu-school-api-mode";
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
  let currentSchoolAccount = null;

  async function requestJson(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }
    if (!response.ok) {
      const error = new Error(payload.message || `Request failed with status ${response.status}.`);
      error.code = payload.error;
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  function isStaticBackendHost() {
    return window.location.protocol === "file:"
      || !["", "localhost", "127.0.0.1"].includes(window.location.hostname);
  }

  function backendLooksMissing(error) {
    return !error.status || error.status === 404 || error.status === 405;
  }

  function schoolAuthHeaders() {
    const token = getSchoolSessionToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  function getSchoolSessionToken() {
    return sessionStorage.getItem(schoolSessionKey) || localStorage.getItem(schoolSessionKey);
  }

  function setSchoolSessionToken(token) {
    sessionStorage.setItem(schoolSessionKey, token);
    localStorage.setItem(schoolSessionKey, token);
  }

  function clearSchoolSessionToken() {
    sessionStorage.removeItem(schoolSessionKey);
    localStorage.removeItem(schoolSessionKey);
    sessionStorage.removeItem(schoolApiModeKey);
    localStorage.removeItem(schoolApiModeKey);
  }

  async function apiSchoolLogin(email, mobile, password) {
    const payload = await requestJson("/api/school/login", {
      method: "POST",
      body: JSON.stringify({ email, mobile, password })
    });
    setSchoolSessionToken(payload.token);
    sessionStorage.setItem(schoolApiModeKey, "1");
    localStorage.setItem(schoolApiModeKey, "1");
    currentSchoolAccount = payload.school;
    renderSchoolAccount(payload.school);
    return payload.school;
  }

  async function apiSchoolCreate(email, mobile, password) {
    const payload = await requestJson("/api/school/create", {
      method: "POST",
      body: JSON.stringify({ email, mobile, password })
    });
    setSchoolSessionToken(payload.token);
    sessionStorage.setItem(schoolApiModeKey, "1");
    localStorage.setItem(schoolApiModeKey, "1");
    currentSchoolAccount = payload.school;
    renderSchoolAccount(payload.school);
    return payload.school;
  }

  async function apiGetSchoolAccount() {
    const payload = await requestJson("/api/school/account", {
      headers: schoolAuthHeaders()
    });
    currentSchoolAccount = payload.school;
    return payload.school;
  }

  async function apiSaveSchoolDetails(details) {
    const payload = await requestJson("/api/school/details", {
      method: "POST",
      headers: schoolAuthHeaders(),
      body: JSON.stringify(details)
    });
    currentSchoolAccount = payload.school;
    return payload.school;
  }

  async function apiGetDownloadCount() {
    const payload = await requestJson("/api/downloads");
    return Number(payload.count || 0);
  }

  async function apiIncrementDownloadCount() {
    const payload = await requestJson("/api/downloads", {
      method: "POST",
      body: JSON.stringify({})
    });
    return Number(payload.count || 0);
  }

  function setDownloadCountValue(count) {
    if (downloadCount) downloadCount.textContent = Number(count || 0).toString();
    if (adminDownloadStats) adminDownloadStats.textContent = Number(count || 0).toString();
  }

  const licensePrices = {
    "200": {
      label: "Upto 200 Students",
      plan: "Basic School",
      "1": { actual: "6,999", discount: "6,499" },
      "2": { actual: "13,399", discount: "12,399" },
      "5": { actual: "31,999", discount: "29,499" },
      "10": { actual: "61,599", discount: "56,599" }
    },
    "500": {
      label: "Upto 500 Students",
      plan: "Standard School",
      "1": { actual: "9,999", discount: "9,299" },
      "2": { actual: "19,199", discount: "17,799" },
      "5": { actual: "45,999", discount: "42,499" },
      "10": { actual: "88,799", discount: "81,799" }
    },
    "1000": {
      label: "Upto 1000 Students",
      plan: "Premium School",
      "1": { actual: "13,999", discount: "12,799" },
      "2": { actual: "27,099", discount: "24,699" },
      "5": { actual: "65,999", discount: "59,999" },
      "10": { actual: "1,28,799", discount: "1,16,799" }
    },
    unlimited: {
      label: "Unlimited Students",
      plan: "Enterprise School",
      "1": { actual: "21,999", discount: "20,399" },
      "2": { actual: "43,099", discount: "39,899" },
      "5": { actual: "1,05,999", discount: "97,999" },
      "10": { actual: "2,08,799", discount: "1,92,799" }
    }
  };

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

  async function renderDownloadCount() {
    try {
      const count = await apiGetDownloadCount();
      setDownloadCountValue(count);
    } catch {
      setDownloadCountValue(Number(localStorage.getItem(downloadCountKey) || 0));
    }
  }

  if (isAdminView) {
    adminDownloadStats?.classList.add("visible");
    adminLeads?.classList.add("visible");
    adminFeedback?.classList.add("visible");
  }

  renderDownloadCount();

  softwareDownload?.addEventListener("click", () => {
    apiIncrementDownloadCount()
      .then(setDownloadCountValue)
      .catch(() => {
        const nextCount = Number(localStorage.getItem(downloadCountKey) || 0) + 1;
        localStorage.setItem(downloadCountKey, nextCount.toString());
        setDownloadCountValue(nextCount);
      });
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

  function getAfterSalesFeedback() {
    try {
      return JSON.parse(localStorage.getItem(afterSalesKey) || "[]");
    } catch {
      return [];
    }
  }

  function saveAfterSalesFeedback(items) {
    localStorage.setItem(afterSalesKey, JSON.stringify(items));
  }

  function getSchoolAccounts() {
    try {
      return JSON.parse(localStorage.getItem(schoolAccountsKey) || "[]");
    } catch {
      return [];
    }
  }

  function getSchoolActivationUpdates() {
    try {
      return JSON.parse(localStorage.getItem(schoolActivationUpdatesKey) || "{}");
    } catch {
      return {};
    }
  }

  function saveSchoolAccounts(accounts) {
    localStorage.setItem(schoolAccountsKey, JSON.stringify(accounts));
  }

  function normalizeLoginValue(value) {
    return String(value || "").trim().toLowerCase();
  }

  function normalizeMobile(value) {
    return normalizeLoginValue(value).replace(/\s+/g, "");
  }

  function normalizeMachineId(value) {
    return normalizeLoginValue(value).replace(/\s+/g, "");
  }

  function getCurrentSchoolAccount() {
    if (currentSchoolAccount) return currentSchoolAccount;
    const accountId = getSchoolSessionToken();
    if (!accountId) return null;
    const account = getSchoolAccounts().find((item) => item.id === accountId) || null;
    if (!account) return null;
    const activationUpdate = getSchoolActivationUpdates()[account.id] || {};
    return { ...account, ...activationUpdate };
  }

  function setFieldValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value || "";
  }

  function getSelectedPrice() {
    const capacity = portalLicenseCapacity?.value || "";
    const duration = portalLicenseDuration?.value || "";
    return licensePrices[capacity]?.[duration] || null;
  }

  function formatPrice(value) {
    return value ? `₹ ${value}` : "Select option";
  }

  function updateLicensePricePreview(account) {
    const price = getSelectedPrice();
    if (portalActualPrice) portalActualPrice.textContent = formatPrice(price?.actual || account?.actualPrice);
    if (portalDiscountPrice) portalDiscountPrice.textContent = formatPrice(price?.discount || account?.discountPrice);
  }

  function renderSchoolAccount(account) {
    if (!account || !schoolAccountPanel) return;
    schoolAccountPanel.hidden = false;
    setFieldValue("portalSchoolName", account.schoolName);
    setFieldValue("portalContactPerson", account.contactPerson);
    setFieldValue("portalCity", account.city);
    setFieldValue("portalLicenseCapacity", account.licenseCapacity || account.students);
    setFieldValue("portalLicenseDuration", account.licenseDuration);
    setFieldValue("portalMachineId", account.machineId);
    setFieldValue("portalRemarks", account.remarks);
    if (schoolActivationStatus) schoolActivationStatus.textContent = account.status || "Pending";
    if (schoolActivationKey) schoolActivationKey.textContent = account.activationKey || "Not issued yet";
    if (schoolActivationDate) schoolActivationDate.textContent = account.activationDate || "Not set";
    if (schoolExpiryDate) schoolExpiryDate.textContent = account.expiryDate || "Not set";
    if (schoolAdminNote) schoolAdminNote.textContent = account.adminNote || "No message from admin yet.";
    updateLicensePricePreview(account);
  }

  async function refreshSchoolDashboardAccount() {
    if (!schoolDashboardPage) return;
    const token = getSchoolSessionToken();
    if (!token) {
      clearSchoolSessionToken();
      window.location.href = "school-login.html";
      return;
    }

    if (!isStaticBackendHost() && (sessionStorage.getItem(schoolApiModeKey) === "1" || localStorage.getItem(schoolApiModeKey) === "1")) {
      try {
        const apiAccount = await apiGetSchoolAccount();
        renderSchoolAccount(apiAccount);
        return;
      } catch {
        clearSchoolSessionToken();
        window.location.href = "school-login.html";
        return;
      }
    }

    const account = getCurrentSchoolAccount();
    if (!account) {
      clearSchoolSessionToken();
      window.location.href = "school-login.html";
      return;
    }
    currentSchoolAccount = account;
    renderSchoolAccount(account);
  }

  function clearSchoolAccountView() {
    if (schoolAccountPanel) schoolAccountPanel.hidden = true;
    if (schoolActivationStatus) schoolActivationStatus.textContent = "Pending";
    if (schoolActivationKey) schoolActivationKey.textContent = "Not issued yet";
    if (schoolActivationDate) schoolActivationDate.textContent = "Not set";
    if (schoolExpiryDate) schoolExpiryDate.textContent = "Not set";
    if (schoolAdminNote) schoolAdminNote.textContent = "No message from admin yet.";
    schoolActivationForm?.reset();
  }

  function findSchoolAccount(accounts, email, mobile) {
    const normalizedEmail = normalizeLoginValue(email);
    const normalizedMobile = normalizeMobile(mobile);
    return accounts.find((item) => normalizeLoginValue(item.email) === normalizedEmail && normalizeMobile(item.mobile) === normalizedMobile) || null;
  }

  function loginSchoolAccount(email, mobile, password) {
    const accounts = getSchoolAccounts();
    const account = findSchoolAccount(accounts, email, mobile);

    if (!account) {
      return { error: "ACCOUNT_NOT_FOUND" };
    }

    if (account && account.password && account.password !== password) {
      return { error: "PASSWORD_MISMATCH" };
    }

    if (account && !account.password) {
      account.password = password;
      account.updatedAt = new Date().toLocaleString("en-IN");
      saveSchoolAccounts(accounts);
    }

    setSchoolSessionToken(account.id);
    renderSchoolAccount(account);
    return account;
  }

  function createSchoolAccount(email, mobile, password) {
    const accounts = getSchoolAccounts();
    const existing = findSchoolAccount(accounts, email, mobile);

    if (existing) {
      return { error: "ACCOUNT_EXISTS", email: existing.email, mobile: existing.mobile };
    }

    const account = {
      id: `school-${Date.now()}`,
      createdAt: new Date().toLocaleString("en-IN"),
      updatedAt: new Date().toLocaleString("en-IN"),
      email: email.trim(),
      mobile: mobile.trim(),
      password,
      schoolName: "",
      contactPerson: "",
      city: "",
      licenseCapacity: "",
      licenseDuration: "",
      actualPrice: "",
      discountPrice: "",
      students: "",
      plan: "",
      machineId: "",
      remarks: "",
      status: "Pending",
      activationKey: "",
      activationDate: "",
      expiryDate: "",
      adminNote: ""
    };

    accounts.unshift(account);
    saveSchoolAccounts(accounts);
    setSchoolSessionToken(account.id);
    renderSchoolAccount(account);
    return account;
  }

  function getCheckedValue(name) {
    return feedbackForm?.querySelector(`input[name="${name}"]:checked`)?.value || "";
  }

  function getCheckedValues(name) {
    return [...(feedbackForm?.querySelectorAll(`input[name="${name}"]:checked`) || [])].map((item) => item.value);
  }

  function getFormCheckedValue(formElement, name) {
    return formElement?.querySelector(`input[name="${name}"]:checked`)?.value || "";
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
      feedbackTableBody.innerHTML = '<tr><td colspan="13">No app feedback saved yet.</td></tr>';
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
        <td>${escapeHtml(item.customerFeedback)}</td>
        <td>${escapeHtml(item.futureFeatures)}</td>
      </tr>
    `).join("");
  }

  function renderPublishedAfterSalesFeedback() {
    if (!publishedAfterSalesList) return;
    const items = getAfterSalesFeedback().filter((item) => item.comment);
    if (publishedAfterSalesCount) {
      publishedAfterSalesCount.textContent = `${items.length} feedback`;
    }

    if (!items.length) {
      publishedAfterSalesList.innerHTML = '<article class="published-feedback-empty">No after-sales feedback published yet.</article>';
      return;
    }

    publishedAfterSalesList.innerHTML = items.slice(0, 6).map((item) => `
      <article class="published-feedback-card">
        <div class="feedback-card-top">
          <div>
            <h4>${escapeHtml(item.school || "VidyaSetu customer")}</h4>
            <span>${escapeHtml(item.role || "School user")}</span>
          </div>
          <div class="feedback-rating-pill">${escapeHtml(item.rating ? `${item.rating}/5` : "Not rated")}</div>
        </div>
        <p>${escapeHtml(item.comment)}</p>
        <div class="feedback-module-tags">
          <span>${escapeHtml(item.serviceArea || "After-sales service")}</span>
        </div>
      </article>
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
      row["Customer Feedback"] = item.customerFeedback;
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
      "Customer Feedback",
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
  renderPublishedAfterSalesFeedback();
  if (schoolDashboardPage && !getSchoolSessionToken()) {
    window.location.href = "school-login.html";
    return;
  }
  refreshSchoolDashboardAccount();
  window.addEventListener("focus", refreshSchoolDashboardAccount);
  window.addEventListener("pageshow", refreshSchoolDashboardAccount);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshSchoolDashboardAccount();
  });
  window.addEventListener("storage", (event) => {
    if ([schoolAccountsKey, schoolActivationUpdatesKey].includes(event.key)) refreshSchoolDashboardAccount();
  });
  portalLicenseCapacity?.addEventListener("change", () => updateLicensePricePreview(getCurrentSchoolAccount()));
  portalLicenseDuration?.addEventListener("change", () => updateLicensePricePreview(getCurrentSchoolAccount()));

  schoolLoginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("portalEmail")?.value.trim() || "";
    const mobile = document.getElementById("portalMobile")?.value.trim() || "";
    const password = document.getElementById("portalPassword")?.value || "";

    if (!isStaticBackendHost()) {
      try {
        await apiSchoolLogin(email, mobile, password);
        if (schoolLoginStatus) {
          schoolLoginStatus.textContent = "Account opened. Redirecting to school dashboard.";
        }
        window.location.href = "school-dashboard.html";
        return;
      } catch (error) {
        if (!backendLooksMissing(error)) {
          clearSchoolSessionToken();
          clearSchoolAccountView();
          if (schoolLoginStatus) schoolLoginStatus.textContent = error.message || "Unable to login. Please try again.";
          return;
        }
      }
    }

    const account = loginSchoolAccount(email, mobile, password);
    sessionStorage.removeItem(schoolApiModeKey);
    localStorage.removeItem(schoolApiModeKey);
    if (account?.error === "ACCOUNT_NOT_FOUND") {
      clearSchoolSessionToken();
      clearSchoolAccountView();
      if (schoolLoginStatus) schoolLoginStatus.textContent = "No school account found for this e-mail/mobile no. Please create an account first.";
      return;
    }
    if (account?.error === "PASSWORD_MISMATCH") {
      clearSchoolSessionToken();
      clearSchoolAccountView();
      if (schoolLoginStatus) schoolLoginStatus.textContent = "Password does not match this school account. Please check and try again.";
      return;
    }
    if (schoolLoginStatus) {
      schoolLoginStatus.textContent = "Account opened. Redirecting to school dashboard.";
    }
    window.location.href = "school-dashboard.html";
  });

  schoolCreateForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("createPortalEmail")?.value.trim() || "";
    const mobile = document.getElementById("createPortalMobile")?.value.trim() || "";
    const password = document.getElementById("createPortalPassword")?.value || "";

    if (!isStaticBackendHost()) {
      try {
        await apiSchoolCreate(email, mobile, password);
        if (schoolCreateStatus) {
          schoolCreateStatus.textContent = "School account created. Redirecting to activation details.";
        }
        window.location.href = "school-dashboard.html";
        return;
      } catch (error) {
        if (!backendLooksMissing(error)) {
          clearSchoolSessionToken();
          clearSchoolAccountView();
          if (schoolCreateStatus) schoolCreateStatus.textContent = error.message || "Unable to create account. Please try again.";
          return;
        }
      }
    }

    const account = createSchoolAccount(email, mobile, password);
    sessionStorage.removeItem(schoolApiModeKey);
    localStorage.removeItem(schoolApiModeKey);

    if (account?.error === "ACCOUNT_EXISTS") {
      clearSchoolSessionToken();
      clearSchoolAccountView();
      if (schoolCreateStatus) {
        schoolCreateStatus.textContent = `Account already exist for ${account.email || email} email/mobile no.`;
      }
      return;
    }

    if (schoolCreateStatus) {
      schoolCreateStatus.textContent = "School account created. Redirecting to activation details.";
    }
    window.location.href = "school-dashboard.html";
  });

  schoolActivationForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const account = getCurrentSchoolAccount();
    if (!account) {
      if (schoolActivationFormStatus) schoolActivationFormStatus.textContent = "Please open your school account first.";
      return;
    }

    const machineId = document.getElementById("portalMachineId")?.value.trim() || "";
    const licenseCapacity = portalLicenseCapacity?.value || "";
    const licenseDuration = portalLicenseDuration?.value || "";
    const selectedPrice = getSelectedPrice();

    if (!selectedPrice) {
      if (schoolActivationFormStatus) {
        schoolActivationFormStatus.textContent = "Please select license capacity and duration to calculate the price.";
      }
      return;
    }

    const activationDetails = {
      schoolName: document.getElementById("portalSchoolName")?.value.trim(),
      contactPerson: document.getElementById("portalContactPerson")?.value.trim(),
      city: document.getElementById("portalCity")?.value.trim(),
      students: licensePrices[licenseCapacity]?.label || "",
      plan: licensePrices[licenseCapacity]?.plan || "",
      licenseCapacity,
      licenseDuration,
      licenseDurationLabel: `${licenseDuration} ${licenseDuration === "1" ? "Year" : "Years"}`,
      actualPrice: selectedPrice.actual,
      discountPrice: selectedPrice.discount,
      machineId,
      remarks: document.getElementById("portalRemarks")?.value.trim()
    };

    if (!isStaticBackendHost() && (sessionStorage.getItem(schoolApiModeKey) === "1" || localStorage.getItem(schoolApiModeKey) === "1")) {
      try {
        const savedAccount = await apiSaveSchoolDetails(activationDetails);
        renderSchoolAccount(savedAccount);
        if (schoolActivationFormStatus) {
          schoolActivationFormStatus.textContent = "Activation details saved in database. The admin can now review your machine ID and provide the key.";
        }
        return;
      } catch (error) {
        if (schoolActivationFormStatus) {
          schoolActivationFormStatus.textContent = error.message || "Unable to save activation details. Please try again.";
        }
        return;
      }
    }

    const accounts = getSchoolAccounts();
    const index = accounts.findIndex((item) => item.id === account.id);
    if (index === -1) return;
    const duplicateMachine = accounts.find((item) => item.id !== account.id && item.machineId && normalizeMachineId(item.machineId) === normalizeMachineId(machineId));
    if (duplicateMachine) {
      if (schoolActivationFormStatus) {
        schoolActivationFormStatus.textContent = `Machine ID already registered with ${duplicateMachine.schoolName || duplicateMachine.email}. Please check the machine ID.`;
      }
      return;
    }

    accounts[index] = {
      ...accounts[index],
      updatedAt: new Date().toLocaleString("en-IN"),
      ...activationDetails,
      status: accounts[index].activationKey ? accounts[index].status || "Activated" : "Pending"
    };

    saveSchoolAccounts(accounts);
    renderSchoolAccount(accounts[index]);
    if (schoolActivationFormStatus) {
      schoolActivationFormStatus.textContent = "Activation details saved. The admin can now review your machine ID and provide the key.";
    }
  });

  schoolLogout?.addEventListener("click", () => {
    clearSchoolSessionToken();
    currentSchoolAccount = null;
    clearSchoolAccountView();
    if (schoolLoginStatus) schoolLoginStatus.textContent = "Logged out. Enter school login details to open the activation account again.";
    schoolLoginForm?.reset();
    schoolCreateForm?.reset();
    if (schoolDashboardPage) window.location.href = "school-login.html";
  });

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
      customerFeedback: document.getElementById("customerFeedback")?.value.trim(),
      futureFeatures: document.getElementById("futureFeatures")?.value.trim()
    };
    const feedbackItems = getFeedback();
    feedbackItems.unshift(feedback);
    saveFeedback(feedbackItems);
    renderFeedback();
    feedbackStatus.textContent = "Thank you. Your feedback has been saved for the VidyaSetu ERP team.";
    feedbackForm.reset();
  });

  afterSalesForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const item = {
      submittedAt: new Date().toLocaleString("en-IN"),
      school: document.getElementById("afterSalesSchool")?.value.trim(),
      contactPerson: document.getElementById("afterSalesContact")?.value.trim(),
      role: document.getElementById("afterSalesRole")?.value.trim(),
      mobile: document.getElementById("afterSalesMobile")?.value.trim(),
      serviceArea: document.getElementById("afterSalesService")?.value.trim(),
      rating: getFormCheckedValue(afterSalesForm, "afterSalesRating"),
      comment: document.getElementById("afterSalesComment")?.value.trim(),
      improvement: document.getElementById("afterSalesImprovement")?.value.trim()
    };
    const items = getAfterSalesFeedback();
    items.unshift(item);
    saveAfterSalesFeedback(items);
    renderPublishedAfterSalesFeedback();
    afterSalesStatus.textContent = "Thank you. Your after-sales feedback has been saved and published on this site.";
    afterSalesForm.reset();
  });
})();
