(function () {
  const PASSWORD = "Himu**1983";
  const AUTH_KEY = "vidyasetu-admin-auth";
  const keys = {
    downloads: "vidyasetu-download-count",
    leads: "vidyasetu-demo-leads",
    feedback: "vidyasetu-app-feedback",
    afterSales: "vidyasetu-after-sales-feedback",
    activation: "vidyasetu-school-accounts",
    activationUpdates: "vidyasetu-school-activation-updates"
  };

  const loginPanel = document.getElementById("adminLoginPanel");
  const dashboard = document.getElementById("adminDashboard");
  const loginForm = document.getElementById("adminLoginForm");
  const passwordInput = document.getElementById("adminPassword");
  const loginStatus = document.getElementById("adminLoginStatus");
  const logout = document.getElementById("adminLogout");
  const activationStatus = document.getElementById("adminActivationStatus");

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
      const error = new Error(payload.message || "Request failed.");
      error.status = response.status;
      error.code = payload.error;
      throw error;
    }
    return payload;
  }

  function adminAuthHeaders() {
    const token = sessionStorage.getItem(AUTH_KEY);
    return token && token !== "1" ? { Authorization: `Bearer ${token}` } : {};
  }

  async function apiAdminLogin(password) {
    const payload = await requestJson("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password })
    });
    sessionStorage.setItem(AUTH_KEY, payload.token);
    return payload.token;
  }

  async function apiGetSchools() {
    const payload = await requestJson("/api/admin/schools", {
      headers: adminAuthHeaders()
    });
    return payload.schools || [];
  }

  async function apiSaveActivation(accountId, activationUpdate) {
    const payload = await requestJson(`/api/admin/schools/${encodeURIComponent(accountId)}/activation`, {
      method: "PUT",
      headers: adminAuthHeaders(),
      body: JSON.stringify(activationUpdate)
    });
    return payload;
  }

  async function apiDeleteSchool(accountId) {
    await requestJson(`/api/admin/schools/${encodeURIComponent(accountId)}`, {
      method: "DELETE",
      headers: adminAuthHeaders()
    });
  }

  async function apiGetDownloadCount() {
    const payload = await requestJson("/api/downloads");
    return Number(payload.count || 0);
  }

  function getJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  }

  function getObject(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch {
      return {};
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

  function activationRows(items) {
    return items.map((item) => ({
      Created: item.createdAt,
      Updated: item.updatedAt,
      School: item.schoolName,
      Contact: item.contactPerson,
      Email: item.email,
      Mobile: item.mobile,
      City: item.city,
      Capacity: item.students,
      Duration: item.licenseDurationLabel,
      Plan: item.plan,
      "Actual Price": item.actualPrice,
      "Discount Price": item.discountPrice,
      "Machine ID": item.machineId,
      Remarks: item.remarks,
      Status: item.status,
      "Activation Key": item.activationKey,
      "Activation Date": item.activationDate,
      "Expiry Date": item.expiryDate,
      "Admin Message": item.adminNote
    }));
  }

  function renderActivationRows(items) {
    const body = document.getElementById("adminActivationRows");
    if (!body) return;
    if (!items.length) {
      body.innerHTML = '<tr><td colspan="14">No activation accounts saved.</td></tr>';
      return;
    }

    body.innerHTML = items.map((item) => `
      <tr data-account-id="${escapeHtml(item.id)}">
        <td>${escapeHtml(item.updatedAt || item.createdAt)}</td>
        <td><strong>${escapeHtml(item.schoolName || "School details pending")}</strong><br><span>${escapeHtml(item.contactPerson || "")}</span><br><span>${escapeHtml(item.city || "")}</span></td>
        <td>${escapeHtml(item.email)}<br>${escapeHtml(item.mobile)}</td>
        <td>${escapeHtml(item.machineId || "Not submitted")}</td>
        <td>${escapeHtml(item.students || "Not selected")}</td>
        <td>${escapeHtml(item.licenseDurationLabel || "Not selected")}</td>
        <td>${escapeHtml(item.actualPrice ? `₹ ${item.actualPrice}` : "Not calculated")}</td>
        <td>${escapeHtml(item.discountPrice ? `₹ ${item.discountPrice}` : "Not calculated")}</td>
        <td>
          <select class="form-control form-select" data-activation-field="status">
            ${["Pending", "Under Review", "Activated", "Rejected"].map((status) => `<option${(item.status || "Pending") === status ? " selected" : ""}>${status}</option>`).join("")}
          </select>
        </td>
        <td><input class="form-control" data-activation-field="activationKey" value="${escapeHtml(item.activationKey)}" placeholder="Enter activation key"></td>
        <td><input class="form-control" data-activation-field="activationDate" type="date" value="${escapeHtml(item.activationDate)}"></td>
        <td><input class="form-control" data-activation-field="expiryDate" type="date" value="${escapeHtml(item.expiryDate)}"></td>
        <td><textarea class="form-control" data-activation-field="adminNote" placeholder="Message for school">${escapeHtml(item.adminNote)}</textarea></td>
        <td>
          <div class="admin-row-actions">
            <button class="btn btn-primary btn-sm" data-save-activation type="button"><i class="bi bi-save"></i> Save</button>
            <button class="btn btn-outline-danger btn-sm" data-delete-activation type="button"><i class="bi bi-trash"></i> Delete</button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  async function renderDashboard() {
    const leads = getJson(keys.leads);
    const feedback = getJson(keys.feedback);
    const afterSales = getJson(keys.afterSales);
    let activation = getJson(keys.activation);
    try {
      activation = await apiGetSchools();
    } catch (error) {
      if (activationStatus) {
        activationStatus.textContent = error.status === 401
          ? "Please login again to load database activation records."
          : "Database is not reachable. Showing browser-saved activation records only.";
      }
    }
    let downloads = Number(localStorage.getItem(keys.downloads) || 0);
    try {
      downloads = await apiGetDownloadCount();
    } catch {
      downloads = Number(localStorage.getItem(keys.downloads) || 0);
    }

    setText("adminDownloadCount", downloads.toString());
    setText("adminActivationCount", activation.length.toString());
    setText("adminLeadCount", leads.length.toString());
    setText("adminAppFeedbackCount", feedback.length.toString());
    setText("adminAfterSalesCount", afterSales.length.toString());

    renderRows("adminLeadRows", leadRows(leads), ["Date", "School", "Contact", "Mobile", "Email", "City", "Students", "Message"], "No demo requests saved.");
    renderActivationRows(activation);
    renderRows("adminAppFeedbackRows", appFeedbackRows(feedback), ["Date", "School", "Contact", "Designation", "Mobile", "Email", "Students", "Rating", "Feedback", "Future Features"], "No app feedback saved.");
    renderRows("adminAfterSalesRows", afterSalesRows(afterSales), ["Date", "School", "Contact", "Designation", "Mobile", "Service", "Rating", "Feedback", "Improvement"], "No after-sales feedback saved.");
  }

  async function showDashboard() {
    loginPanel.hidden = true;
    dashboard.hidden = false;
    await renderDashboard();
  }

  if (sessionStorage.getItem(AUTH_KEY) === "1") {
    sessionStorage.removeItem(AUTH_KEY);
  }

  if (sessionStorage.getItem(AUTH_KEY)) {
    showDashboard();
  }

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await apiAdminLogin(passwordInput.value);
      loginStatus.textContent = "";
      await showDashboard();
      return;
    } catch (error) {
      const backendIsMissing = !error.status || error.status === 404 || error.status === 405;
      if (passwordInput.value === PASSWORD && backendIsMissing) {
        sessionStorage.setItem(AUTH_KEY, "1");
        loginStatus.textContent = "";
        await showDashboard();
        return;
      }
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

  document.getElementById("adminActivationRows")?.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest("[data-delete-activation]");
    if (deleteButton) {
      const row = deleteButton.closest("tr[data-account-id]");
      if (!row) return;
      if (!window.confirm("Delete this school login record and activation details?")) return;
      if (sessionStorage.getItem(AUTH_KEY) !== "1") {
        try {
          await apiDeleteSchool(row.dataset.accountId);
          if (activationStatus) activationStatus.textContent = "School login record deleted from database.";
          await renderDashboard();
          return;
        } catch (error) {
          if (activationStatus) activationStatus.textContent = error.message || "Unable to delete database record.";
          return;
        }
      }
      const accounts = getJson(keys.activation).filter((account) => account.id !== row.dataset.accountId);
      const activationUpdates = getObject(keys.activationUpdates);
      delete activationUpdates[row.dataset.accountId];
      localStorage.setItem(keys.activation, JSON.stringify(accounts));
      localStorage.setItem(keys.activationUpdates, JSON.stringify(activationUpdates));
      if (activationStatus) activationStatus.textContent = "School login record deleted.";
      renderDashboard();
      return;
    }

    const saveButton = event.target.closest("[data-save-activation]");
    if (!saveButton) return;
    const row = saveButton.closest("tr[data-account-id]");
    if (!row) return;

    const activationUpdate = {
      status: row.querySelector('[data-activation-field="status"]')?.value || "Pending",
      activationKey: row.querySelector('[data-activation-field="activationKey"]')?.value.trim() || "",
      activationDate: row.querySelector('[data-activation-field="activationDate"]')?.value || "",
      expiryDate: row.querySelector('[data-activation-field="expiryDate"]')?.value || "",
      adminNote: row.querySelector('[data-activation-field="adminNote"]')?.value.trim() || "",
      updatedAt: new Date().toLocaleString("en-IN")
    };

    if (sessionStorage.getItem(AUTH_KEY) !== "1") {
      try {
        const payload = await apiSaveActivation(row.dataset.accountId, activationUpdate);
        if (activationStatus) {
          const emailMessage = payload.email?.message ? ` ${payload.email.message}` : "";
          activationStatus.textContent = `Activation details saved in database.${emailMessage}`;
        }
        await renderDashboard();
        return;
      } catch (error) {
        if (activationStatus) activationStatus.textContent = error.message || "Unable to save activation details in database.";
        return;
      }
    }

    const accounts = getJson(keys.activation);
    const index = accounts.findIndex((account) => account.id === row.dataset.accountId);
    if (index === -1) return;

    accounts[index] = {
      ...accounts[index],
      ...activationUpdate
    };

    const activationUpdates = getObject(keys.activationUpdates);
    activationUpdates[accounts[index].id] = activationUpdate;
    localStorage.setItem(keys.activation, JSON.stringify(accounts));
    localStorage.setItem(keys.activationUpdates, JSON.stringify(activationUpdates));
    if (activationStatus) activationStatus.textContent = "Activation details saved. The school account will show the updated key after refresh or when opened again.";
    await renderDashboard();
  });

  document.querySelectorAll("[data-export]").forEach((button) => {
    button.addEventListener("click", async () => {
      const type = button.dataset.export;
      if (type === "activation") {
        let activation = getJson(keys.activation);
        try {
          activation = await apiGetSchools();
        } catch {
          if (activationStatus) activationStatus.textContent = "Database is not reachable. Exporting browser-saved activation records only.";
        }
        const rows = activationRows(activation);
        exportCsv("vidyasetu-activation-accounts.csv", ["Created", "Updated", "School", "Contact", "Email", "Mobile", "City", "Capacity", "Duration", "Plan", "Actual Price", "Discount Price", "Machine ID", "Remarks", "Status", "Activation Key", "Activation Date", "Expiry Date", "Admin Message"], rows);
      }
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
