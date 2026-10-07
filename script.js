// Seed initial data to LocalStorage if empty
if (!localStorage.getItem('users')) {
    const defaultUsers = [
        { name: 'SARIHADDU SIDDHARTHA', email: 'sarihaddusiddhartha36@gmail.com', password: '8341751080', role: 'admin' },
        { name: 'S.SIDDHARTHA', email: 'sarihaddusiddhartha36@gmail.com', password: '8341751080', role: 'student' }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

if (!localStorage.getItem('courses')) {
    const defaultCourses = [
        { id: '1', title: 'Full Stack Web Development', category: 'Web Tech', desc: 'Learn HTML, CSS, JavaScript and build robust web apps.', instructor: 'Admin Instructor' },
        { id: '2', title: 'Introduction to Data Structures', category: 'Computer Science', desc: 'Master arrays, linked lists, trees, and graphs.', instructor: 'Admin Instructor' }
    ];
    localStorage.setItem('courses', JSON.stringify(defaultCourses));
}

if (!localStorage.getItem('enrollments')) localStorage.setItem('enrollments', JSON.stringify([]));
if (!localStorage.getItem('submissions')) localStorage.setItem('submissions', JSON.stringify([]));

// State variables
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// On Page Load
window.onload = function() {
    checkAuthState();
};

// Switch Login / Signup Tabs
function switchAuthTab(tab) {
    document.getElementById('auth-alert').innerHTML = '';
    if (tab === 'login') {
        document.getElementById('tab-login').classList.add('active');
        document.getElementById('tab-signup').classList.remove('active');
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('signup-form').classList.add('hidden');
    } else {
        document.getElementById('tab-signup').classList.add('active');
        document.getElementById('tab-login').classList.remove('active');
        document.getElementById('signup-form').classList.remove('hidden');
        document.getElementById('login-form').classList.add('hidden');
    }
}

// Handle Signup
function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;

    let users = JSON.parse(localStorage.getItem('users'));
    if (users.some(u => u.email === email)) {
        showAlert('Email is already registered!', 'error');
        return;
    }

    users.push({ name, email, password, role });
    localStorage.setItem('users', JSON.stringify(users));
    showAlert('Account created successfully! Please login.', 'success');
    switchAuthTab('login');
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    let users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        showAlert('Invalid email or password!', 'error');
        return;
    }

    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    checkAuthState();
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    checkAuthState();
}

// Auth & Redirection Controller
function checkAuthState() {
    const authView = document.getElementById('auth-view');
    const adminDashboard = document.getElementById('admin-dashboard');
    const studentDashboard = document.getElementById('student-dashboard');
    const userNav = document.getElementById('user-nav');
    const userWelcome = document.getElementById('user-welcome');

    // Hide all first
    authView.classList.add('hidden');
    adminDashboard.classList.add('hidden');
    studentDashboard.classList.add('hidden');
    userNav.classList.add('hidden');

    if (!currentUser) {
        authView.classList.remove('hidden');
    } else {
        userNav.classList.remove('hidden');
        userWelcome.innerText = `Welcome, ${currentUser.name} (${currentUser.role.toUpperCase()})`;

        // Module-wise redirection using JavaScript
        if (currentUser.role === 'admin') {
            adminDashboard.classList.remove('hidden');
            loadAdminCourses();
            loadAdminSubmissions();
        } else {
            studentDashboard.classList.remove('hidden');
            loadStudentCourses();
        }
    }
}

function showAlert(message, type) {
    const alertDiv = document.getElementById('auth-alert');
    alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

// --- ADMIN MODULE FUNCTIONS ---
function switchAdminTab(tabName, el) {
    document.querySelectorAll('#admin-dashboard .sidebar a').forEach(a => a.classList.remove('active'));
    el.classList.add('active');

    document.getElementById('admin-tab-courses').classList.add('hidden');
    document.getElementById('admin-tab-add-course').classList.add('hidden');
    document.getElementById('admin-tab-submissions').classList.add('hidden');

    document.getElementById(`admin-tab-${tabName}`).classList.remove('hidden');
    if (tabName === 'courses') loadAdminCourses();
    if (tabName === 'submissions') loadAdminSubmissions();
}

function handleAddCourse(e) {
    e.preventDefault();
    const title = document.getElementById('course-title').value;
    const category = document.getElementById('course-category').value;
    const desc = document.getElementById('course-desc').value;

    let courses = JSON.parse(localStorage.getItem('courses'));
    const newCourse = {
        id: Date.now().toString(),
        title,
        category,
        desc,
        instructor: currentUser.name
    };

    courses.push(newCourse);
    localStorage.setItem('courses', JSON.stringify(courses));
    alert('Course published successfully!');
    e.target.reset();
    switchAdminTab('courses', document.querySelector('#admin-dashboard .sidebar a'));
}

function loadAdminCourses() {
    const courses = JSON.parse(localStorage.getItem('courses'));
    const container = document.getElementById('admin-courses-list');
    container.innerHTML = '';

    if (courses.length === 0) {
        container.innerHTML = '<p>No courses found.</p>';
        return;
    }

    courses.forEach(c => {
        container.innerHTML += `
            <div class="card">
                <div>
                    <span class="badge">${c.category}</span>
                    <h3>${c.title}</h3>
                    <p>${c.desc}</p>
                </div>
                <button class="danger" onclick="deleteCourse('${c.id}')">Delete Course</button>
            </div>
        `;
    });
}

function deleteCourse(id) {
    let courses = JSON.parse(localStorage.getItem('courses'));
    courses = courses.filter(c => c.id !== id);
    localStorage.setItem('courses', JSON.stringify(courses));
    loadAdminCourses();
}

function loadAdminSubmissions() {
    const submissions = JSON.parse(localStorage.getItem('submissions'));
    const courses = JSON.parse(localStorage.getItem('courses'));
    const container = document.getElementById('admin-submissions-list');
    container.innerHTML = '';

    if (submissions.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">No student assignments submitted yet.</p>';
        return;
    }

    submissions.forEach((sub, idx) => {
        const course = courses.find(c => c.id === sub.courseId);
        container.innerHTML += `
            <div class="card" style="margin-bottom: 1rem;">
                <p><strong>Student:</strong> ${sub.studentEmail}</p>
                <p><strong>Course:</strong> ${course ? course.title : 'Unknown'}</p>
                <p><strong>Submission:</strong> ${sub.text}</p>
                <p><strong>Status:</strong> <span style="color: var(--success); font-weight:600;">${sub.status}</span></p>
            </div>
        `;
    });
}

// --- STUDENT MODULE FUNCTIONS ---
function switchStudentTab(tabName, el) {
    document.querySelectorAll('#student-dashboard .sidebar a').forEach(a => a.classList.remove('active'));
    el.classList.add('active');

    document.getElementById('student-tab-browse').classList.add('hidden');
    document.getElementById('student-tab-enrolled').classList.add('hidden');
    document.getElementById('student-tab-assignments').classList.add('hidden');

    document.getElementById(`student-tab-${tabName}`).classList.remove('hidden');
    if (tabName === 'browse') loadStudentCourses();
    if (tabName === 'enrolled') loadEnrolledCourses();
    if (tabName === 'assignments') loadStudentAssignments();
}

function loadStudentCourses() {
    const courses = JSON.parse(localStorage.getItem('courses'));
    const enrollments = JSON.parse(localStorage.getItem('enrollments'));
    const container = document.getElementById('student-browse-list');
    container.innerHTML = '';

    const userEnrollments = enrollments.filter(e => e.studentEmail === currentUser.email).map(e => e.courseId);

    courses.forEach(c => {
        const isEnrolled = userEnrollments.includes(c.id);
        container.innerHTML += `
            <div class="card">
                <div>
                    <span class="badge">${c.category}</span>
                    <h3>${c.title}</h3>
                    <p>${c.desc}</p>
                    <p style="font-size: 0.85rem; font-weight: 500;">Instructor: ${c.instructor}</p>
                </div>
                ${isEnrolled 
                    ? '<button style="background: var(--success); cursor: default;" disabled>Enrolled</button>' 
                    : `<button onclick="enrollCourse('${c.id}')">Enroll Now</button>`
                }
            </div>
        `;
    });
}

function enrollCourse(courseId) {
    let enrollments = JSON.parse(localStorage.getItem('enrollments'));
    enrollments.push({ studentEmail: currentUser.email, courseId });
    localStorage.setItem('enrollments', JSON.stringify(enrollments));
    alert('Successfully enrolled in the course!');
    loadStudentCourses();
}

function loadEnrolledCourses() {
    const courses = JSON.parse(localStorage.getItem('courses'));
    const enrollments = JSON.parse(localStorage.getItem('enrollments'));
    const container = document.getElementById('student-enrolled-list');
    container.innerHTML = '';

    const userCourseIds = enrollments.filter(e => e.studentEmail === currentUser.email).map(e => e.courseId);
    const enrolledCourses = courses.filter(c => userCourseIds.includes(c.id));

    if (enrolledCourses.length === 0) {
        container.innerHTML = '<p>You are not enrolled in any courses yet.</p>';
        return;
    }

    enrolledCourses.forEach(c => {
        container.innerHTML += `
            <div class="card">
                <div>
                    <span class="badge">${c.category}</span>
                    <h3>${c.title}</h3>
                    <p>${c.desc}</p>
                </div>
                <button onclick="switchStudentTab('assignments', document.querySelectorAll('#student-dashboard .sidebar a')[2])">Submit Assignment</button>
            </div>
        `;
    });
}

function loadStudentAssignments() {
    const courses = JSON.parse(localStorage.getItem('courses'));
    const enrollments = JSON.parse(localStorage.getItem('enrollments'));
    const submissions = JSON.parse(localStorage.getItem('submissions'));
    const container = document.getElementById('student-assignments-list');
    container.innerHTML = '';

    const userCourseIds = enrollments.filter(e => e.studentEmail === currentUser.email).map(e => e.courseId);
    const enrolledCourses = courses.filter(c => userCourseIds.includes(c.id));

    if (enrolledCourses.length === 0) {
        container.innerHTML = '<p>Enroll in a course to submit assignments.</p>';
        return;
    }

    enrolledCourses.forEach(c => {
        const existingSub = submissions.find(s => s.studentEmail === currentUser.email && s.courseId === c.id);
        container.innerHTML += `
            <div class="card" style="margin-bottom: 1.5rem;">
                <h3>${c.title} - Final Assignment</h3>
                <p>Upload your GitHub link or project repository notes below.</p>
                ${existingSub 
                    ? `<p style="color: var(--success); font-weight: 600;">Status: Submitted (${existingSub.text})</p>`
                    : `
                      <input type="text" id="sub-${c.id}" placeholder="Paste GitHub Repository link here...">
                      <button onclick="submitAssignment('${c.id}')">Submit Assignment</button>
                    `
                }
            </div>
        `;
    });
}

function submitAssignment(courseId) {
    const textInput = document.getElementById(`sub-${courseId}`).value;
    if (!textInput.trim()) {
        alert('Please enter submission details.');
        return;
    }

    let submissions = JSON.parse(localStorage.getItem('submissions'));
    submissions.push({
        studentEmail: currentUser.email,
        courseId,
        text: textInput,
        status: 'Reviewed / Submitted'
    });

    localStorage.setItem('submissions', JSON.stringify(submissions));
    alert('Assignment submitted successfully!');
    loadStudentAssignments();
}