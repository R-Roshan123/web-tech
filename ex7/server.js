const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const rooms = [
  { number: "A-101", type: "Standard", capacity: 4 },
  { number: "A-102", type: "Standard", capacity: 4 },
  { number: "B-201", type: "Deluxe", capacity: 3 },
  { number: "B-202", type: "Deluxe", capacity: 3 },
  { number: "C-301", type: "Premium", capacity: 2 },
  { number: "C-302", type: "Premium", capacity: 2 }
];

let students = [
  { id: "STU-1001", name: "Aarav Sharma", email: "aarav@example.com", phone: "98765 43210", gender: "Male", course: "Computer Science", room: "A-101", date: "2026-10-04", feeStatus: "Paid", feeAmount: 45000, paymentDate: "2026-10-05" },
  { id: "STU-1002", name: "Meera Nair", email: "meera@example.com", phone: "98765 12345", gender: "Female", course: "Information Technology", room: "A-101", date: "2026-10-06", feeStatus: "Pending", feeAmount: 45000, paymentDate: null },
  { id: "STU-1003", name: "Rohan Das", email: "rohan@example.com", phone: "91234 56789", gender: "Male", course: "Electronics", room: "B-201", date: "2026-10-08", feeStatus: "Paid", feeAmount: 52000, paymentDate: "2026-10-09" }
];

function roomDetails() {
  return rooms.map((room) => {
    const occupied = students.filter((student) => student.room === room.number).length;
    return { ...room, occupied, available: room.capacity - occupied, status: occupied >= room.capacity ? "Full" : "Available" };
  });
}

function dashboard() {
  const details = roomDetails();
  const totalBeds = details.reduce((sum, room) => sum + room.capacity, 0);
  const occupiedBeds = details.reduce((sum, room) => sum + room.occupied, 0);
  return {
    totalStudents: students.length,
    totalRooms: rooms.length,
    occupiedRooms: details.filter((room) => room.occupied > 0).length,
    availableRooms: details.filter((room) => room.available > 0).length,
    totalBeds,
    occupiedBeds,
    availableBeds: totalBeds - occupiedBeds,
    occupancy: totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
    paidFees: students.filter((student) => student.feeStatus === "Paid").length,
    pendingFees: students.filter((student) => student.feeStatus === "Pending").length
  };
}

function validateStudent(body) {
  const required = ["name", "email", "phone", "gender", "course", "room"];
  return required.every((field) => typeof body[field] === "string" && body[field].trim()) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email);
}

app.get("/api/dashboard", (req, res) => res.json(dashboard()));
app.get("/api/students", (req, res) => res.json(students));
app.get("/api/students/:id", (req, res) => {
  const student = students.find((item) => item.id === req.params.id);
  return student ? res.json(student) : res.status(404).json({ message: "Student not found." });
});
app.get("/api/rooms", (req, res) => res.json(roomDetails()));
app.get("/api/reports", (req, res) => res.json({ ...dashboard(), feeSummary: { paid: dashboard().paidFees, pending: dashboard().pendingFees } }));

app.post("/api/students", (req, res) => {
  if (!validateStudent(req.body)) return res.status(400).json({ message: "Please complete all fields with a valid email address." });
  const room = roomDetails().find((item) => item.number === req.body.room);
  if (!room) return res.status(400).json({ message: "Selected room does not exist." });
  if (room.available < 1) return res.status(409).json({ message: "This room is fully occupied. Choose another room." });
  const id = `STU-${1001 + students.length}`;
  const student = { id, ...req.body, name: req.body.name.trim(), email: req.body.email.trim(), phone: req.body.phone.trim(), date: new Date().toISOString().slice(0, 10), feeStatus: "Pending", feeAmount: 45000, paymentDate: null };
  students.push(student);
  res.status(201).json(student);
});

app.put("/api/students/:id", (req, res) => {
  const index = students.findIndex((item) => item.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: "Student not found." });
  if (!validateStudent(req.body)) return res.status(400).json({ message: "Please complete all fields with a valid email address." });
  const room = roomDetails().find((item) => item.number === req.body.room);
  const oldRoom = students[index].room;
  if (!room || (req.body.room !== oldRoom && room.available < 1)) return res.status(409).json({ message: "Selected room has no available beds." });
  students[index] = { ...students[index], ...req.body };
  res.json(students[index]);
});

app.delete("/api/students/:id", (req, res) => {
  const index = students.findIndex((item) => item.id === req.params.id);
  if (index < 0) return res.status(404).json({ message: "Student not found." });
  students.splice(index, 1);
  res.status(204).end();
});

app.post("/api/rooms/allocate", (req, res) => {
  const room = roomDetails().find((item) => item.number === req.body.room);
  if (!room || room.available < 1) return res.status(409).json({ message: "Room is unavailable." });
  res.json({ message: `Room ${room.number} is available for allocation.`, room });
});

app.patch("/api/students/:id/fees", (req, res) => {
  const student = students.find((item) => item.id === req.params.id);
  if (!student || !["Paid", "Pending"].includes(req.body.status)) return res.status(400).json({ message: "Invalid student or fee status." });
  student.feeStatus = req.body.status;
  student.paymentDate = req.body.status === "Paid" ? new Date().toISOString().slice(0, 10) : null;
  res.json(student);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error." });
});

app.use((req, res, next) => {
  if (req.method === "GET") return res.sendFile(path.join(__dirname, "public", "index.html"));
  next();
});
app.listen(PORT, () => console.log(`HostelHub running at http://localhost:${PORT}`));
