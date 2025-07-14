import React, { useState, useEffect } from 'react';
import { initializeFirebase, signInUser } from './firebase';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import ErrorModal from './components/ErrorModal';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

function App() {
  // State variables
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [firebaseServices, setFirebaseServices] = useState(null);

  // Initialize Firebase and authenticate user
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Firebase services
        const services = initializeFirebase();
        setFirebaseServices(services);

        // Sign in the user (anonymously if needed)
        const user = await signInUser(services.auth);
        
        // Set the user ID (from auth or generate a fallback)
        const currentUserId = user?.uid || uuidv4();
        setUserId(currentUserId);

        // Set up Firestore listener once we have the user ID
        setupFirestoreListener(services.db, currentUserId);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Failed to initialize the application. Please try again later.');
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Set up Firestore listener for todos
  const setupFirestoreListener = (db, uid) => {
    try {
      // Get the app ID from global variable or use a default
      const appId = window.__app_id || 'default-app-id';
      
      // Create a reference to the todos collection for this user
      const todosRef = collection(db, `artifacts/${appId}/users/${uid}/todos`);
      
      // Create a query ordered by timestamp
      const todosQuery = query(todosRef, orderBy('timestamp', 'desc'));
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(todosQuery, (snapshot) => {
        const todoList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTodos(todoList);
        setLoading(false);
      }, (err) => {
        console.error('Error fetching todos:', err);
        setError('Failed to load your todo items. Please try again later.');
        setLoading(false);
      });

      // Return the unsubscribe function for cleanup
      return unsubscribe;
    } catch (err) {
      console.error('Error setting up Firestore listener:', err);
      setError('Failed to connect to the database. Please try again later.');
      setLoading(false);
    }
  };

  // Clear error message
  const clearError = () => setError(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-indigo-600">
          <h1 className="text-xl font-semibold text-white">Todo Application</h1>
          {userId && (
            <p className="mt-1 text-sm text-indigo-100">
              User ID: <span className="font-mono bg-indigo-500 px-2 py-0.5 rounded text-xs">{userId}</span>
            </p>
          )}
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <TodoForm 
                firebaseServices={firebaseServices} 
                userId={userId} 
                setError={setError} 
              />
              
              <TodoList 
                todos={todos} 
                firebaseServices={firebaseServices} 
                userId={userId} 
                setError={setError} 
              />
            </>
          )}
        </div>
      </div>

      {/* Error Modal */}
      {error && <ErrorModal message={error} onClose={clearError} />}
    </div>
  );
}

export default App;