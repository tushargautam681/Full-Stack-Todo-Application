import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * TodoForm component for adding new todo items
 * @param {Object} props - Component props
 * @param {Object} props.firebaseServices - Firebase services (db, auth)
 * @param {string} props.userId - Current user ID
 * @param {Function} props.setError - Function to set error message
 */
const TodoForm = ({ firebaseServices, userId, setError }) => {
  // State for the todo input
  const [todoText, setTodoText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form submission to add a new todo
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!todoText.trim()) return;
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Get the app ID from global variable or use a default
      const appId = window.__app_id || 'default-app-id';
      
      // Reference to the user's todos collection
      const todosRef = collection(
        firebaseServices.db, 
        `artifacts/${appId}/users/${userId}/todos`
      );
      
      // Add the new todo document
      await addDoc(todosRef, {
        text: todoText,
        completed: false,
        timestamp: serverTimestamp()
      });
      
      // Clear the input field after successful submission
      setTodoText('');
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex items-center">
        <input
          type="text"
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className={`px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            'Add'
          )}
        </button>
      </div>
    </form>
  );
};

export default TodoForm;