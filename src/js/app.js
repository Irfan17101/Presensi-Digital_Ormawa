var app = new Framework7({
  root: '#app',
  theme: 'md',
  routes: [
    {
      path: '/',
      url: 'index.html',
    },
    {
      path: '/presensi/',
      url: 'pages/presensi/presensi.html',
    },
    {
      path: '/presensi-hmif/',
      url: 'pages/presensi/Presensi-HMIF.html',
    },
    {
      path: '/presensi-hmsi/',
      url: 'pages/presensi/Presensi-HMSI.html',
    },
    {
      path: '/presensi-bem/',
      url: 'pages/presensi/Presensi-BEM.html',
    },
    {
      path: '/presensi-bpm/',
      url: 'pages/presensi/Presensi-BPM.html',
    },
    {
      path: '/presensi-ab/',
      url: 'pages/presensi/Presensi-AB.html',
    },
    {
      path: '/presensi-ak/',
      url: 'pages/presensi/Presensi-AK.html',
    },
    {
      path: '/rekap-kehadiran/',
      url: 'pages/rekap/kehadiran.html',
    },
    {
      path: '/rekap-izin/',
      url: 'pages/rekap/izin.html',
    },
    {
      path: '/notifications/',
      url: 'pages/notifications.html',
    },
    {
      path: '/login/',
      url: 'pages/auth/login.html',
    },
    {
      path: '/register/',
      url: 'pages/auth/register.html',
    },
    {
      path: '/dashboard-admin/',
      url: 'pages/dashboard/dashboard-admin.html',
    },
    {
      path: '/dashboard-anggota/',
      url: 'pages/dashboard/dashboard-anggota.html',
    }
  ]
});

var mainView = app.views.create('.view-main');