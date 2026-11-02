const $ = (selector) => document.querySelector(selector);
const api = async (url, options) => {
  const response = await fetch(url, options);
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
};
let state = { students: [], rooms: [], dashboard: {} };

function notify(message, error = false) {
  const toast = $("#toast"); toast.textContent = message; toast.className = `toast show${error ? " error" : ""}`;
  setTimeout(() => { toast.className = "toast"; }, 2800);
}
function initials(name) { return name.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase(); }
function statusBadge(status) { return `<span class="badge ${status.toLowerCase()}">${status}</span>`; }
function studentRow(student, compact = false) {
  return `<tr><td><div class="student-cell"><span class="student-dot">${initials(student.name)}</span>${student.name}</div></td>${compact ? `<td>${student.id}</td><td>${student.course}</td><td>${student.room}</td>` : `<td>${student.id}</td><td>${student.email}</td><td>${student.phone}</td><td>${student.course}</td><td>${student.room}</td>`}<td>${statusBadge(student.feeStatus)}</td><td class="actions"><button title="Edit student" data-edit="${student.id}">✎</button><button class="danger" title="Delete student" data-delete="${student.id}">×</button></td></tr>`;
}
function renderStats() {
  const items = [["▣", "Total students", state.dashboard.totalStudents, "blue"], ["▥", "Total rooms", state.dashboard.totalRooms, "purple"], ["♙", "Occupied rooms", state.dashboard.occupiedRooms, "red"], ["⌂", "Available rooms", state.dashboard.availableRooms, "green"]];
  $("#stats").innerHTML = items.map(([icon, label, value, tone]) => `<article class="stat"><div class="stat-icon ${tone}">${icon}</div><div><p>${label}</p><h3>${value}</h3><small>${label === "Available rooms" ? "Ready for allocation" : "Updated just now"}</small></div></article>`).join("");
}
function renderStudents() {
  $("#studentTable tbody").innerHTML = state.students.slice(-5).reverse().map((student) => studentRow(student, true)).join("");
  $("#allStudentTable tbody").innerHTML = state.students.map((student) => studentRow(student)).join("");
}
function renderRooms() {
  $("#roomGrid").innerHTML = state.rooms.map((room) => `<article class="room-card"><div class="room-head"><h3>${room.number}</h3><span class="badge ${room.available ? "paid" : "pending"}">${room.status}</span></div><p class="room-type">${room.type} room · ${room.capacity} beds</p><div class="room-meta"><span>Occupied beds</span><strong>${room.occupied} / ${room.capacity}</strong></div><div class="room-progress"><span class="${room.available ? "" : "full"}" style="width:${(room.occupied / room.capacity) * 100}%"></span></div><div class="room-meta"><span>Available beds</span><strong>${room.available}</strong></div></article>`).join("");
}
function renderFees() {
  $("#feeSummary").innerHTML = `<div class="fee-box paid"><h3>${state.dashboard.paidFees}</h3><p>Students with paid fees</p></div><div class="fee-box pending"><h3>${state.dashboard.pendingFees}</h3><p>Students with pending fees</p></div>`;
  $("#feeTable tbody").innerHTML = state.students.map((student) => `<tr><td><div class="student-cell"><span class="student-dot">${initials(student.name)}</span>${student.name}</div></td><td>${student.id}</td><td>${student.room}</td><td>₹${student.feeAmount.toLocaleString("en-IN")}</td><td><select class="fee-status" data-fee="${student.id}"><option ${student.feeStatus === "Paid" ? "selected" : ""}>Paid</option><option ${student.feeStatus === "Pending" ? "selected" : ""}>Pending</option></select></td><td>${student.paymentDate || "—"}</td></tr>`).join("");
}
function renderReports() {
  const d = state.dashboard;
  $("#reportGrid").innerHTML = [["Registered students", d.totalStudents, 100], ["Room occupancy", `${d.occupancy}%`, d.occupancy], ["Available beds", d.availableBeds, d.totalBeds ? (d.availableBeds / d.totalBeds) * 100 : 0], ["Paid fee records", `${d.paidFees}/${d.totalStudents}`, d.totalStudents ? (d.paidFees / d.totalStudents) * 100 : 0]].map(([label, value, width]) => `<article class="report-card"><p>${label}</p><h3>${value}</h3><div class="report-bar"><span style="width:${width}%"></span></div></article>`).join("");
}
async function refresh() {
  [state.dashboard, state.students, state.rooms] = await Promise.all([api("/api/dashboard"), api("/api/students"), api("/api/rooms")]);
  renderStats(); renderStudents(); renderRooms(); renderFees(); renderReports(); fillRooms();
}
function fillRooms(selected = "") { $("#room").innerHTML = `<option value="">Select room</option>${state.rooms.filter((room) => room.available || room.number === selected).map((room) => `<option value="${room.number}" ${room.number === selected ? "selected" : ""}>${room.number} — ${room.available} bed${room.available === 1 ? "" : "s"} available</option>`).join("")}`; }
function openModal(student) {
  $("#studentModal").classList.remove("hidden"); $("#editId").value = student?.id || ""; $("#modalTitle").textContent = student ? "Edit student" : "Register student";
  ["name", "email", "phone", "gender", "course"].forEach((field) => { $(`#${field}`).value = student?.[field] || ""; }); fillRooms(student?.room || "");
}
async function handleStudent(event) {
  event.preventDefault();
  const id = $("#editId").value; const body = Object.fromEntries(["name", "email", "phone", "gender", "course", "room"].map((field) => [field, $(`#${field}`).value]));
  try { await api(id ? `/api/students/${id}` : "/api/students", { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); $("#studentModal").classList.add("hidden"); $("#studentForm").reset(); await refresh(); notify(id ? "Student updated successfully." : "Student registered successfully."); } catch (error) { notify(error.message, true); }
}
document.addEventListener("click", async (event) => {
  const nav = event.target.closest(".nav-link"); if (nav) { document.querySelectorAll(".page-section").forEach((section) => section.classList.remove("active-page")); $(`#${nav.dataset.section}`).classList.add("active-page"); document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active")); nav.classList.add("active"); $("#sidebar").classList.remove("open"); }
  if (event.target.closest("[data-open-student]")) openModal();
  const edit = event.target.closest("[data-edit]"); if (edit) openModal(state.students.find((student) => student.id === edit.dataset.edit));
  const remove = event.target.closest("[data-delete]"); if (remove && confirm("Delete this student record?")) { try { await api(`/api/students/${remove.dataset.delete}`, { method: "DELETE" }); await refresh(); notify("Student record deleted."); } catch (error) { notify(error.message, true); } }
});
$("#studentForm").addEventListener("submit", handleStudent); $("#closeModal").addEventListener("click", () => $("#studentModal").classList.add("hidden")); $("#menuToggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#studentSearch").addEventListener("input", (event) => { const query = event.target.value.toLowerCase(); $("#allStudentTable tbody").innerHTML = state.students.filter((student) => `${student.name} ${student.id}`.toLowerCase().includes(query)).map((student) => studentRow(student)).join(""); });
document.addEventListener("change", async (event) => { if (!event.target.matches(".fee-status")) return; try { await api(`/api/students/${event.target.dataset.fee}/fees`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: event.target.value }) }); await refresh(); notify("Fee status updated."); } catch (error) { notify(error.message, true); } });
$("#saveSettings").addEventListener("click", () => notify("Settings saved successfully."));
$("#currentDate").textContent = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date());
refresh().catch((error) => notify(error.message, true));
