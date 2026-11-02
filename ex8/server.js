
// ==========================================
// LEARNSPHERE - NODE.JS SERVER APPLICATION
// EXERCISE 08
// ==========================================

const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;


// Middleware to read JSON data
app.use(express.json());


// Serve frontend files from public folder
app.use(express.static(path.join(__dirname, "public")));


// In-memory course database
let courses = [
    {
        id: 101,
        name: "Full-Stack Web Development",
        category: "Development",
        duration: "8 Weeks",
        level: "Beginner"
    },
    {
        id: 102,
        name: "Data Science Fundamentals",
        category: "Data Science",
        duration: "6 Weeks",
        level: "Beginner"
    },
    {
        id: 103,
        name: "Artificial Intelligence Basics",
        category: "Artificial Intelligence",
        duration: "7 Weeks",
        level: "Intermediate"
    },
    {
        id: 104,
        name: "UI/UX Design Essentials",
        category: "Design",
        duration: "4 Weeks",
        level: "Beginner"
    },
    {
        id: 105,
        name: "Cybersecurity Foundations",
        category: "Cybersecurity",
        duration: "5 Weeks",
        level: "Beginner"
    }
];


// ROUTE 1: HOME PAGE
app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );

});


// ROUTE 2: GET ALL COURSES
app.get("/api/courses", (req, res) => {

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });

});


// ROUTE 3: GET COURSE BY ID
app.get("/api/courses/:id", (req, res) => {

    const course = courses.find(
        item => item.id === Number(req.params.id)
    );

    if (!course) {

        return res.status(404).json({
            success: false,
            message: "Course not found"
        });

    }

    res.status(200).json({
        success: true,
        data: course
    });

});


// ROUTE 4: ADD NEW COURSE
app.post("/api/courses", (req, res) => {

    const { name, category, duration, level } = req.body;


    // Validate course information
    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof category !== "string" ||
        !category.trim() ||
        typeof duration !== "string" ||
        !duration.trim() ||
        typeof level !== "string" ||
        !level.trim()
    ) {

        return res.status(400).json({
            success: false,
            message: "Please provide valid course details."
        });

    }


    // Create new course
    const newCourse = {

        id: Date.now(),

        name: name.trim(),

        category: category.trim(),

        duration: duration.trim(),

        level: level.trim()

    };


    courses.push(newCourse);


    res.status(201).json({

        success: true,

        message: "Course added successfully!",

        data: newCourse

    });

});


// ROUTE 5: 404 ERROR HANDLING
app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "Endpoint Not Found"

    });

});


// SERVER ERROR HANDLING
app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({

        success: false,

        message: "Internal Server Error"

    });

});


// START SERVER
app.listen(PORT, () => {

    console.log(
        `LearnSphere Server running at http://localhost:${PORT}`
    );

});
    