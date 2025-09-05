import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 🔥 CONFIGURACIÓN DE FIREBASE
// Configuración exacta de tu proyecto "Feria-2025"

const firebaseConfig = {
  apiKey: "AIzaSyDxjJQxbIgQOp7V8ZOzHMEdQiS48sR8fNQ",
  authDomain: "feria-2025.firebaseapp.com",
  projectId: "feria-2025",
  storageBucket: "feria-2025.firebasestorage.app",
  messagingSenderId: "606697537967",
  appId: "1:606697537967:web:55c7b45f15438ff723ef5a",
  measurementId: "G-3XHDSNORZD"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar auth, db y storage para usar en otros archivos
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 