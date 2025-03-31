import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyC5RwqDnzxuIAxQDsySRgos-zcrwBG1_E8",
  authDomain: "lief-77bde.firebaseapp.com",
  projectId: "lief-77bde",
  storageBucket: "lief-77bde.firebasestorage.app",
  messagingSenderId: "160225059021",
  appId: "1:160225059021:web:7be60313ce386938b74984",
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }

