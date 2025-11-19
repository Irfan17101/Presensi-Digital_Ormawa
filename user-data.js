// users-data.js - Data dummy untuk testing
const defaultUsers = [
    // Admin accounts - bisa login dengan username atau email
    {
        id: 1,
        username: "adminbem",
        password: "admin123",
        name: "Aldo Ferdiansyah",
        role: "admin",
        organization: "BEM",
        email: "adminbem@presinize.com",
        nim: "2304140"
    },
    {
        id: 2,
        username: "adminhmif", 
        password: "admin123",
        name: "Admin HMIF",
        role: "admin",
        organization: "HMIF",
        email: "adminhmif@presinize.com",
        nim: "1000001"
    },
    {
        id: 3,
        username: "adminhmsi",
        password: "admin123",
        name: "Admin HMSI",
        role: "admin",
        organization: "HMSI",
        email: "adminhmsi@presinize.com",
        nim: "1000002"
    },
    {
        id: 4,
        username: "adminbpm",
        password: "admin123",
        name: "Emir Davonka Ibrahim",
        role: "admin",
        organization: "BPM",
        email: "adminbpm@presinize.com",
        nim: "230414028"
    },
    {
        id: 5,
        username: "adminhmab",
        password: "admin123",
        name: "Admin HMAB",
        role: "admin",
        organization: "HMAB",
        email: "adminhmab@presinize.com",
        nim: "1000003"
    },
    {
        id: 6,
        username: "adminhma",
        password: "admin123",
        name: "Admin HMA",
        role: "admin",
        organization: "HMA",
        email: "adminhma@presinize.com",
        nim: "1000004"
    },
    // User accounts - bisa login dengan username atau email gmail
    {
        id: 7,
        username: "irfan",
        password: "user123",
        name: "Irfan Ramadhani",
        role: "user",
        organization: "HMSI",
        email: "irfan@gmail.com",
        nim: "10122099"
    },
    {
        id: 8,
        username: "aqshal",
        password: "user123",
        name: "Aqshal Syauqi A",
        role: "user",
        organization: "HMAB",
        email: "aqshal@gmail.com",
        nim: "10122089"
    },
    {
        id: 9,
        username: "aldo",
        password: "user123",
        name: "Aldo Ferdiyansah",
        role: "user",
        organization: "BEM",
        email: "aldo@gmail.com",
        nim: "2304140"
    },
    {
        id: 10,
        username: "emir",
        password: "user123",
        name: "Emir Davanka Ibrohim",
        role: "user",
        organization: "BPM",
        email: "emir@gmail.com",
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