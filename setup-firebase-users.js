// Script para configurar usuarios en Firebase
// Ejecuta este script una vez para crear los usuarios en Firebase Auth y Firestore

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Configuración de Firebase (usa la misma que en firebaseConfig.js)
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "palco-reservas.firebaseapp.com",
  projectId: "palco-reservas",
  storageBucket: "palco-reservas.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Datos de los usuarios
const users = [
  {
    email: 'admin@feria.com',
    password: 'admin123',
    role: 'ADMIN_PRINCIPAL',
    name: 'Administrador Principal',
    vendedor: 'Sistema'
  },
  {
    email: 'admin2@feria.com',
    password: 'admin456',
    role: 'ADMIN_SECUNDARIO',
    name: 'Administrador Secundario',
    vendedor: 'Admin Secundario'
  },
  {
    email: 'vendedor1@feria.com',
    password: 'vend123',
    role: 'EMPLEADO',
    name: 'Juan Pérez',
    vendedor: 'Juan Pérez'
  },
  {
    email: 'vendedor2@feria.com',
    password: 'vend456',
    role: 'EMPLEADO',
    name: 'María González',
    vendedor: 'María González'
  },
  {
    email: 'vendedor3@feria.com',
    password: 'vend321',
    role: 'EMPLEADO',
    name: 'Carlos Rodríguez',
    vendedor: 'Carlos Rodríguez'
  },
  {
    email: 'vendedor4@feria.com',
    password: 'vend410',
    role: 'EMPLEADO',
    name: 'Ana Martínez',
    vendedor: 'Ana Martínez'
  }
];

async function setupUsers() {
  console.log('🚀 Iniciando configuración de usuarios en Firebase...');
  
  for (const userData of users) {
    try {
      console.log(`📝 Creando usuario: ${userData.email}`);
      
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;
      console.log(`✅ Usuario creado en Auth: ${user.uid}`);
      
      // Crear documento en Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        email: userData.email,
        role: userData.role,
        name: userData.name,
        vendedor: userData.vendedor,
        createdAt: new Date()
      });
      
      console.log(`✅ Documento creado en Firestore para: ${userData.email}`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️ Usuario ya existe: ${userData.email}`);
      } else {
        console.error(`❌ Error creando usuario ${userData.email}:`, error.message);
      }
    }
  }
  
  console.log('🎉 Configuración completada!');
}

// Ejecutar el script
setupUsers().catch(console.error); 