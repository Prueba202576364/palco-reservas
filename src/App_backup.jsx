import { useState, useEffect } from 'react';
import './App.css';
import MapaPalcos from './MapaPalcos';
import { AuthProvider, useAuth, LoginForm, UserHeader, ProtectedComponent } from './Auth';
import firebaseSyncService from './services/firebaseSync';
import QRUploader from './components/QRUploader';
import imageService from './services/imageService';

const PALCOS_COMPLETOS = [15, 16, 19, 20, 22, 23, 27, 32];
const PALCOS_SILLAS = [14, 21, 33];

// ... (contenido restaurado)









