import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Use the provided global variables for Firebase configuration
// These variables are expected to be available in the global scope
// __firebase_config, __app_id, __initial_auth_token

/**
 * Initialize Firebase with the provided configuration
 * This function uses global variables that should be provided by the environment
 */
const initializeFirebase = () => {
  try {
    // Use the global Firebase config if available, otherwise use a placeholder
    const firebaseConfig = window.__firebase_config || {
      apiKey: "AIzaSyBpwxO0h0gNVE2cOa2Dl",
      authDomain: "todo-44111.firebaseapp.com",
      projectId: "todo-44111",
      storageBucket: "todo-44111.appspot.com",
      messagingSenderId: "687153801712",
      appId: "1:687153801712:web:594a9185d34052da119535",
      measurementId: "G-B02XXDBK1V"
    };

    // Initialize Firebase app
    const app = initializeApp(firebaseConfig);
    
    // Get Firestore instance
    const db = getFirestore(app);
    
    // Get Auth instance
    const auth = getAuth(app);

    // Return the initialized services
    return { app, db, auth };
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw error;
  }
};

/**
 * Sign in the user anonymously if not already authenticated
 * @param {Object} auth - Firebase Auth instance
 * @returns {Promise<Object>} - User object
 */
const signInUser = async (auth) => {
  try {
    // Check if we have an initial auth token
    if (window.__initial_auth_token) {
      // Use the provided token (implementation would depend on how the token is meant to be used)
      console.log("Using provided auth token");
      // This is a placeholder - actual implementation would depend on the token format and intended use
      return auth.currentUser;
    }
    
    // If no user is signed in, sign in anonymously
    if (!auth.currentUser) {
      const result = await signInAnonymously(auth);
      return result.user;
    }
    
    return auth.currentUser;
  } catch (error) {
    console.error("Error signing in user:", error);
    throw error;
  }
};

// Export the initialized Firebase services and helper functions
export { initializeFirebase, signInUser };