import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const firebaseConfig = {

    apiKey: "AIzaSyBB9zCrqnRvUdw1vQQIGS98-Por0WaRmtg",

    authDomain: "base-de-datos---inventario.firebaseapp.com",

    projectId: "base-de-datos---inventario",

    storageBucket: "base-de-datos---inventario.firebasestorage.app",

    messagingSenderId: "496169022560",

    appId: "1:496169022560:web:7cfc7f6e23b7a2e1f83f05"

    databaseURL: "https://base-de-datos---inventario-default-rtdb.firebaseio.com/"

};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const realtimeDB =
    getDatabase(app);

export { db, realtimeDB };