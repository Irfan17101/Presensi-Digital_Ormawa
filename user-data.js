// users-data.js - Data dummy untuk testing
const defaultUsers = [
    {
        id: 1,
        username: "admin",
        password: "admin123",
        name: "Aldo Ferdiansyah",
        role: "admin",
        organization: "BEM",
        email: "admin@presinize.com",
        nim: "2304140"
    },
    {
        id: 2,
        username: "irfan",
        password: "user123", 
        name: "Irfan Ramadhani",
        role: "user",
        organization: "HMSI",
        email: "irfan@example.com",
        nim: "10122099"
    },
    {
        id: 3,
        username: "aqshal",
        password: "user123",
        name: "Aqshal Syauqi A", 
        role: "user",
        organization: "HMAB",
        email: "aqshal@example.com",
        nim: "10122089"
    },
    {
        id: 4,
        username: "emir",
        password: "user123",
        name: "Emir Davonka Ibrahim",
        role: "user",
        organization: "BPM", 
        email: "emir@example.com",
        nim: "230414028"
    }
];

// Initialize users data jika belum ada di localStorage
if(!localStorage.getItem('presinize_users')) {
    localStorage.setItem('presinize_users', JSON.stringify(defaultUsers));
}

function getUsers() {
    return JSON.parse(localStorage.getItem('presinize_users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('presinize_users', JSON.stringify(users));
}