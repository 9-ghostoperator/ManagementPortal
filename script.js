/*
    College Property Management Portal
    This file uses basic JavaScript functions, arrays and localStorage.
    It is a front-end student demo. It is not a secure production login system.
*/

// Sample accounts for demonstrating the three user roles.
const sampleUsers = [
    { name: "College Admin", email: "admin@college.edu", password: "admin123", role: "Admin" },
    { name: "Maintenance Staff", email: "staff@college.edu", password: "staff123", role: "Staff" },
    { name: "Demo Student", email: "student@college.edu", password: "student123", role: "Student" }
];

// Sample property records to make the project easier to test.
const sampleProperties = [
    { id: "P-001", name: "Main Library", type: "Other", location: "Academic Block, Ground Floor", status: "Occupied" },
    { id: "P-002", name: "Computer Lab 1", type: "Laboratory", location: "Block A, Room 101", status: "Available" },
    { id: "P-003", name: "Seminar Hall", type: "Hall", location: "Admin Block, First Floor", status: "Available" },
    { id: "P-004", name: "Boys Hostel Room 204", type: "Hostel", location: "Hostel Block B", status: "Occupied" },
    { id: "P-005", name: "Physics Laboratory", type: "Laboratory", location: "Science Block, Room 12", status: "Maintenance" }
];

// Sample requests show how status tracking works.
const sampleRequests = [
    {
        id: 101, title: "Projector is not working", propertyId: "P-003", type: "Maintenance",
        priority: "High", details: "The projector does not turn on.",
        requestedBy: "student@college.edu", requestedByName: "Demo Student",
        date: "25/10/2026", status: "Pending"
    },
    {
        id: 102, title: "Check lab computers", propertyId: "P-002", type: "Maintenance",
        priority: "Normal", details: "Please check two slow computers.",
        requestedBy: "staff@college.edu", requestedByName: "Maintenance Staff",
        date: "24/10/2026", status: "In Progress"
    },
    {
        id: 103, title: "Reserve hall for club meeting", propertyId: "P-003", type: "Booking",
        priority: "Normal", details: "Requesting the hall for a student club meeting.",
        requestedBy: "student@college.edu", requestedByName: "Demo Student",
        date: "23/10/2026", status: "Resolved"
    }
];

// Read saved information, or use the sample information the first time.
function loadData(key, startingData) {
    const savedData = localStorage.getItem(key);
    if (savedData) {
        return JSON.parse(savedData);
    }
    localStorage.setItem(key, JSON.stringify(startingData));
    return startingData;
}

let users = loadData("collegePortalUsers", sampleUsers);
let properties = loadData("collegePortalProperties", sampleProperties);
let requests = loadData("collegePortalRequests", sampleRequests);
let currentUser = null;
let propertyBeingEdited = null;

// Save changes so that records remain after refreshing the page.
function saveAllData() {
    localStorage.setItem("collegePortalUsers", JSON.stringify(users));
    localStorage.setItem("collegePortalProperties", JSON.stringify(properties));
    localStorage.setItem("collegePortalRequests", JSON.stringify(requests));
}

// Switch between the Login and Register forms.
function showAuthForm(formName) {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    loginForm.classList.toggle("hidden", formName !== "login");
    registerForm.classList.toggle("hidden", formName !== "register");
    document.getElementById("loginTab").classList.toggle("active", formName === "login");
    document.getElementById("registerTab").classList.toggle("active", formName === "register");
    document.getElementById("loginMessage").textContent = "";
    document.getElementById("registerMessage").textContent = "";
}

// Log in by checking the email and password in the demo user list.
function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const foundUser = users.find(function (user) {
        return user.email.toLowerCase() === email && user.password === password;
    });

    if (!foundUser) {
        document.getElementById("loginMessage").textContent = "Email or password is incorrect.";
        return;
    }

    currentUser = foundUser;
    document.getElementById("authPage").classList.add("hidden");
    document.getElementById("portalPage").classList.remove("hidden");
    document.getElementById("userDetails").textContent = currentUser.name + " (" + currentUser.role + ")";
    document.getElementById("welcomeText").textContent = "Welcome, " + currentUser.name + ". Your role is " + currentUser.role + ".";

    // Only Admin can see the property editing form.
    document.getElementById("propertyFormPanel").classList.toggle("hidden", currentUser.role !== "Admin");

    renderAll();
    showSection("dashboard", document.querySelector(".nav-button"));
}

// New accounts are Students. Admin and Staff accounts are provided for the demo.
function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("registerMessage");

    if (name.length < 2) {
        message.textContent = "Please enter your full name.";
        return;
    }
    if (password.length < 6) {
        message.textContent = "Password must contain at least 6 characters.";
        return;
    }
    if (password !== confirmPassword) {
        message.textContent = "The two passwords do not match.";
        return;
    }
    const emailAlreadyUsed = users.some(function (user) {
        return user.email.toLowerCase() === email;
    });
    if (emailAlreadyUsed) {
        message.textContent = "An account with this email already exists.";
        return;
    }

    users.push({ name: name, email: email, password: password, role: "Student" });
    saveAllData();
    document.getElementById("registerForm").reset();
    showAuthForm("login");
    document.getElementById("loginEmail").value = email;
    document.getElementById("loginMessage").textContent = "Account created. Please log in.";
}

function logoutUser() {
    currentUser = null;
    propertyBeingEdited = null;
    document.getElementById("portalPage").classList.add("hidden");
    document.getElementById("authPage").classList.remove("hidden");
    document.getElementById("loginForm").reset();
    showAuthForm("login");
}

// Display one page section and mark its navigation button as active.
function showSection(sectionName, button) {
    const sectionNames = ["dashboard", "properties", "requests", "reports"];
    sectionNames.forEach(function (name) {
        document.getElementById(name + "Section").classList.toggle("hidden", name !== sectionName);
    });

    document.querySelectorAll(".nav-button").forEach(function (navButton) {
        navButton.classList.remove("active");
    });
    if (button) {
        button.classList.add("active");
    } else {
        const buttons = document.querySelectorAll(".nav-button");
        buttons[sectionNames.indexOf(sectionName)].classList.add("active");
    }

    if (sectionName === "properties") renderProperties();
    if (sectionName === "requests") renderRequests();
    if (sectionName === "reports") renderReports();
}

// Display a green confirmation message at the top of the page.
function showNotice(message) {
    const notice = document.getElementById("notice");
    notice.textContent = message;
    notice.classList.remove("hidden");
    window.setTimeout(function () {
        notice.classList.add("hidden");
    }, 3500);
}

// Convert user-entered text before placing it inside HTML tables.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const replacements = {
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        };
        return replacements[character];
    });
}

function getPropertyName(propertyId) {
    const property = properties.find(function (item) { return item.id === propertyId; });
    return property ? property.name : "Property removed";
}

function getVisibleRequests() {
    if (currentUser.role === "Student") {
        return requests.filter(function (request) {
            return request.requestedBy === currentUser.email;
        });
    }
    return requests;
}

// Update the four dashboard numbers and the recent request list.
function renderDashboard() {
    const visibleRequests = getVisibleRequests();
    document.getElementById("totalProperties").textContent = properties.length;
    document.getElementById("availableProperties").textContent = properties.filter(function (property) {
        return property.status === "Available";
    }).length;
    document.getElementById("openRequests").textContent = visibleRequests.filter(function (request) {
        return request.status !== "Resolved" && request.status !== "Rejected";
    }).length;
    document.getElementById("resolvedRequests").textContent = visibleRequests.filter(function (request) {
        return request.status === "Resolved";
    }).length;

    const recent = visibleRequests.slice().sort(function (a, b) { return b.id - a.id; }).slice(0, 5);
    const table = document.getElementById("recentRequestsTable");
    if (recent.length === 0) {
        table.innerHTML = '<tr><td colspan="4">No requests have been submitted yet.</td></tr>';
        return;
    }
    table.innerHTML = recent.map(function (request) {
        return "<tr><td>" + escapeHTML(request.title) + "</td><td>" + escapeHTML(getPropertyName(request.propertyId)) +
            "</td><td>" + escapeHTML(request.requestedByName) + "</td><td class='status-text'>" + escapeHTML(request.status) + "</td></tr>";
    }).join("");
}

// Add a new property or save changes to an existing property.
function saveProperty(event) {
    event.preventDefault();
    if (currentUser.role !== "Admin") {
        showNotice("Only Admin can change property records.");
        return;
    }

    const name = document.getElementById("propertyName").value.trim();
    const type = document.getElementById("propertyType").value;
    const location = document.getElementById("propertyLocation").value.trim();
    const status = document.getElementById("propertyStatus").value;

    if (!name || !type || !location || !status) {
        showNotice("Please complete all property fields.");
        return;
    }

    if (propertyBeingEdited) {
        const property = properties.find(function (item) { return item.id === propertyBeingEdited; });
        if (property) {
            property.name = name;
            property.type = type;
            property.location = location;
            property.status = status;
        }
        showNotice("Property updated successfully.");
    } else {
        const nextNumber = properties.reduce(function (largest, item) {
            const number = Number(item.id.replace("P-", "")) || 0;
            return Math.max(largest, number);
        }, 0) + 1;
        properties.push({
            id: "P-" + String(nextNumber).padStart(3, "0"),
            name: name, type: type, location: location, status: status
        });
        showNotice("New property added successfully.");
    }

    saveAllData();
    cancelPropertyEdit();
    renderAll();
}

function editProperty(propertyId) {
    if (currentUser.role !== "Admin") return;
    const property = properties.find(function (item) { return item.id === propertyId; });
    if (!property) return;

    propertyBeingEdited = propertyId;
    document.getElementById("propertyName").value = property.name;
    document.getElementById("propertyType").value = property.type;
    document.getElementById("propertyLocation").value = property.location;
    document.getElementById("propertyStatus").value = property.status;
    document.getElementById("propertyFormTitle").textContent = "Edit property " + property.id;
    document.getElementById("savePropertyButton").textContent = "Update property";
    document.getElementById("propertyFormPanel").classList.remove("hidden");
    document.getElementById("propertyFormPanel").scrollIntoView({ behavior: "smooth" });
}

function cancelPropertyEdit() {
    propertyBeingEdited = null;
    document.getElementById("propertyForm").reset();
    document.getElementById("propertyFormTitle").textContent = "Add a property";
    document.getElementById("savePropertyButton").textContent = "Save property";
}

function deleteProperty(propertyId) {
    if (currentUser.role !== "Admin") return;
    const hasRequests = requests.some(function (request) { return request.propertyId === propertyId; });
    if (hasRequests) {
        showNotice("This property has requests. Keep it in the list so request records remain correct.");
        return;
    }
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    properties = properties.filter(function (property) { return property.id !== propertyId; });
    saveAllData();
    renderAll();
    showNotice("Property deleted.");
}

// Show property records based on the search field and status filter.
function renderProperties() {
    const search = document.getElementById("propertySearch").value.trim().toLowerCase();
    const filter = document.getElementById("propertyFilter").value;
    const table = document.getElementById("propertiesTable");

    const matchingProperties = properties.filter(function (property) {
        const searchableText = (property.name + " " + property.type + " " + property.location + " " + property.id).toLowerCase();
        const matchesSearch = searchableText.includes(search);
        const matchesStatus = filter === "All" || property.status === filter;
        return matchesSearch && matchesStatus;
    });

    if (matchingProperties.length === 0) {
        table.innerHTML = '<tr><td colspan="6">No matching properties found.</td></tr>';
    } else {
        table.innerHTML = matchingProperties.map(function (property) {
            let actions = "View only";
            if (currentUser.role === "Admin") {
                actions = '<button class="small-button" onclick="editProperty(\'' + property.id + '\')">Edit</button> ' +
                    '<button class="small-button" onclick="deleteProperty(\'' + property.id + '\')">Delete</button>';
            }
            return "<tr><td>" + escapeHTML(property.id) + "</td><td>" + escapeHTML(property.name) +
                "</td><td>" + escapeHTML(property.type) + "</td><td>" + escapeHTML(property.location) +
                "</td><td class='status-text'>" + escapeHTML(property.status) + "</td><td>" + actions + "</td></tr>";
        }).join("");
    }

    document.getElementById("propertyPermissionNote").textContent = currentUser.role === "Admin"
        ? "Admin access: you can add, edit and delete property records."
        : "Your role is " + currentUser.role + ": you can search and view property records.";
}

// Fill the property dropdown in the request form.
function updatePropertyDropdown() {
    const dropdown = document.getElementById("requestProperty");
    const oldValue = dropdown.value;
    if (properties.length === 0) {
        dropdown.innerHTML = '<option value="">No properties available</option>';
        return;
    }
    dropdown.innerHTML = '<option value="">Choose a property</option>' + properties.map(function (property) {
        return '<option value="' + escapeHTML(property.id) + '">' + escapeHTML(property.id + " - " + property.name) + "</option>";
    }).join("");
    if (properties.some(function (property) { return property.id === oldValue; })) {
        dropdown.value = oldValue;
    }
}

// Create a request and start it with Pending status.
function submitRequest(event) {
    event.preventDefault();

    const title = document.getElementById("requestTitle").value.trim();
    const type = document.getElementById("requestType").value;
    const propertyId = document.getElementById("requestProperty").value;
    const priority = document.getElementById("requestPriority").value;
    const details = document.getElementById("requestDetails").value.trim();

    if (!title || !type || !propertyId || !priority || !details) {
        showNotice("Please complete all request fields.");
        return;
    }

    requests.push({
        id: Date.now(), title: title, propertyId: propertyId, type: type,
        priority: priority, details: details,
        requestedBy: currentUser.email, requestedByName: currentUser.name,
        date: new Date().toLocaleDateString("en-IN"), status: "Pending"
    });
    saveAllData();
    document.getElementById("requestForm").reset();
    renderAll();
    showNotice("Request submitted. Its current status is Pending.");
}

// Staff and Admin can move requests through the workflow.
function updateRequestStatus(requestId, newStatus) {
    if (currentUser.role !== "Admin" && currentUser.role !== "Staff") {
        showNotice("Only Staff and Admin can update request status.");
        renderRequests();
        return;
    }

    const allowedStatuses = ["Pending", "In Progress", "Resolved", "Rejected"];
    if (!allowedStatuses.includes(newStatus)) return;

    const request = requests.find(function (item) { return item.id === requestId; });
    if (request) {
        request.status = newStatus;
        saveAllData();
        renderAll();
        showNotice("Request status updated to " + newStatus + ".");
    }
}

function renderRequests() {
    updatePropertyDropdown();
    const table = document.getElementById("requestsTable");
    const visibleRequests = getVisibleRequests().slice().sort(function (a, b) { return b.id - a.id; });

    if (visibleRequests.length === 0) {
        table.innerHTML = '<tr><td colspan="9">No requests found. Use the form above to create one.</td></tr>';
        return;
    }

    table.innerHTML = visibleRequests.map(function (request) {
        let updateControl = "View only";
        if (currentUser.role === "Admin" || currentUser.role === "Staff") {
            updateControl = '<select aria-label="Update request status" onchange="updateRequestStatus(' + request.id + ', this.value)">' +
                ["Pending", "In Progress", "Resolved", "Rejected"].map(function (status) {
                    return '<option' + (request.status === status ? " selected" : "") + '>' + status + "</option>";
                }).join("") + "</select>";
        }

        return "<tr><td>" + escapeHTML(request.id) + "</td><td title='" + escapeHTML(request.details) + "'>" + escapeHTML(request.title) +
            "</td><td>" + escapeHTML(getPropertyName(request.propertyId)) + "</td><td>" + escapeHTML(request.type) +
            "</td><td>" + escapeHTML(request.priority) + "</td><td>" + escapeHTML(request.requestedByName) +
            "</td><td>" + escapeHTML(request.date) + "</td><td class='status-text'>" + escapeHTML(request.status) +
            "</td><td>" + updateControl + "</td></tr>";
    }).join("");
}

// Prepare simple count reports for the current records.
function renderReports() {
    const propertyStatuses = ["Available", "Occupied", "Maintenance"];
    document.getElementById("propertyReportTable").innerHTML = propertyStatuses.map(function (status) {
        const count = properties.filter(function (property) { return property.status === status; }).length;
        return "<tr><td>" + status + "</td><td>" + count + "</td></tr>";
    }).join("");

    const visibleRequests = getVisibleRequests();
    const requestStatuses = ["Pending", "In Progress", "Resolved", "Rejected"];
    document.getElementById("requestReportTable").innerHTML = requestStatuses.map(function (status) {
        const count = visibleRequests.filter(function (request) { return request.status === status; }).length;
        return "<tr><td>" + status + "</td><td>" + count + "</td></tr>";
    }).join("");
}

// Refresh all parts of the page after adding or updating a record.
function renderAll() {
    renderDashboard();
    renderProperties();
    renderRequests();
    renderReports();
}
