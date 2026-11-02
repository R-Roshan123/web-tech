
// ==========================================
// LEARNSPHERE - FRONTEND JAVASCRIPT
// EXERCISE 08 - NODE.JS SERVER APPLICATION
// ==========================================


// GET HTML ELEMENTS

const courseList = document.getElementById("courseList");

const courseCount = document.getElementById("courseCount");

const courseForm = document.getElementById("courseForm");

const message = document.getElementById("message");

const formMessage = document.getElementById("formMessage");


// COURSE ICON FUNCTION

function getCourseIcon(category) {

    const icons = {
        "Development": "💻",
        "Data Science": "📊",
        "Artificial Intelligence": "🤖",
        "Design": "🎨",
        "Cybersecurity": "🔐"
    };

    return icons[category] || "📚";

}


// FUNCTION 1: DISPLAY COURSES

function displayCourses(courses) {

    courseList.innerHTML = "";

    courseCount.textContent = courses.length;

    if (courses.length === 0) {

        courseList.innerHTML = "<p>No courses available.</p>";

        return;

    }

    courses.forEach(function(course) {

        const card = document.createElement("div");

        card.className = "course-card";

        const icon = getCourseIcon(course.category);

        card.innerHTML = `
            <div class="course-icon">${icon}</div>

            <span class="course-category">
                ${escapeHTML(course.category)}
            </span>

            <h3>${escapeHTML(course.name)}</h3>

            <p>Duration: ${escapeHTML(course.duration)}</p>

            <p class="course-level">
                Level: ${escapeHTML(course.level)}
            </p>
        `;

        courseList.appendChild(card);

    });

}


// Escape text before displaying server data as HTML

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function(character) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];

    });

}


// FUNCTION 2: GET COURSES FROM SERVER

async function loadCourses() {

    try {

        const response = await fetch("/api/courses");

        const result = await response.json();

        if (!response.ok || !result.success) {

            throw new Error("Unable to fetch courses");

        }

        displayCourses(result.data);

    }

    catch (error) {

        courseList.innerHTML =
            "<p>Unable to load courses. Please try again.</p>";

        message.textContent = error.message;

    }

}


// FUNCTION 3: ADD NEW COURSE

async function addCourse(event) {

    event.preventDefault();

    const courseData = {

        name: document.getElementById("courseName").value.trim(),

        category: document.getElementById("category").value.trim(),

        duration: document.getElementById("duration").value.trim(),

        level: document.getElementById("level").value

    };


    try {

        const response = await fetch("/api/courses", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(courseData)

        });


        const result = await response.json();

        if (!response.ok) {

            throw new Error(result.message || "Unable to add course");

        }


        formMessage.textContent =
            "Course added successfully!";

        courseForm.reset();

        loadCourses();

    }

    catch (error) {

        formMessage.textContent = error.message;

    }

}


// CONNECT FORM TO FUNCTION

courseForm.addEventListener("submit", addCourse);


// INITIALIZE PAGE

loadCourses();
