// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyCQ9R1g2PZ-SL78CTIce9tIHWGl-pl8jiE",
    authDomain: "malmo-football.firebaseapp.com",
    databaseURL: "https://malmo-football-default-rtdb.firebaseio.com",
    projectId: "malmo-football",
    storageBucket: "malmo-football.firebasestorage.app",
    messagingSenderId: "98406672510",
    appId: "1:98406672510:web:2e900d02f28d212e31502f",
    measurementId: "G-PT4SGP4WPE"
};

// Uygulamayı başlat
const app = initializeApp(firebaseConfig);

// Veritabanını başlat
export const database = getDatabase(app);
export default app;
