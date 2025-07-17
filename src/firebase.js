import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCE_3Gs0MPseXHRfbrl5x_na_2FoE7QDBY",
  authDomain: "taskmanagment-6e7c8.firebaseapp.com",
  projectId: "taskmanagment-6e7c8",
  storageBucket: "taskmanagment-6e7c8.firebasestorage.app",
  messagingSenderId: "647390994106",
  appId: "1:647390994106:web:60385b7cc8cb9cc04d6c83",
  measurementId: "G-LGN7LZ9JRL",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export default app
