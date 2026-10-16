import { initializeApp } from 'firebase/app'
import { browserLocalPersistence, initializeAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyC11EuTKjSzwqFw-6yHtCOUAkoz_W-Q2NI',
  authDomain: 'kalories-20c02.firebaseapp.com',
  projectId: 'kalories-20c02',
  storageBucket: 'kalories-20c02.firebasestorage.app',
  messagingSenderId: '367220823438',
  appId: '1:367220823438:web:acd29d7e1d9807a58840df',
}

export const app = initializeApp(firebaseConfig)

export const auth = initializeAuth(app, { persistence: browserLocalPersistence })

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})
