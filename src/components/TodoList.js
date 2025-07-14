import React, { useState } from 'react';
import TodoItem from './TodoItem';
import ConfirmModal from './ConfirmModal';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';

/**
 * TodoList component for displaying and managing the list of todos
 * @param {Object} props - Component props
 * @param {Array} props.todos - Array of todo items
 * @param {Object} props.firebaseServices - Firebase services (db, auth)
 * @param {string} props.userId - Current user ID
 * @param {Function} props.setError - Function to set error message
 */
const TodoList = ({ todos, firebaseServices, userId, setError }) => {
  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  /**
   * Handle clearing all completed todos
   */
  const handleClearCompleted = async () => {
    setIsClearing(true);
    
    try {
      // Get the app ID from global variable or use a default
      const appId = window.__app_id || 'default-app-id';
      
      // Reference to the user's todos collection
      const todosRef = collection(
        firebaseServices.db, 
        `artifacts/${appId}/users/${userId}/todos`
      );
      
      // Query for completed todos
      const completedTodosQuery = query(todosRef, where('completed', '==', true));
      const completedTodosSnapshot = await getDocs(completedTodosQuery);
      
      // If no completed todos, return early
      if (completedTodosSnapshot.empty) {
        setShowConfirmModal(false);
        setIsClearing(false);
        return;
      }
      
      // Create a batch to delete all completed todos
      const batch = writeBatch(firebaseServices.db);
      
      completedTodosSnapshot.forEach((document) => {
        batch.delete(doc(firebaseServices.db, `artifacts/${appId}/users/${userId}/todos/${document.id}`));
      });
      
      // Commit the batch
      await batch.commit();
      
      // Close the modal
      setShowConfirmModal(false);
    } catch (err) {
      console.error('Error clearing completed todos:', err);
      setError('Failed to clear completed tasks. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  // Count completed todos
  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <div>
      {/* Todo list header with counts and clear button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Your Tasks <span className="text-sm text-gray-500">({todos.length})</span>
        </h2>
        
        {completedCount > 0 && (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
          >
            Clear completed ({completedCount})
          </button>
        )}
      </div>
      
      {/* List of todo items */}
      <div className="space-y-3">
        {todos.length === 0 ? (
          <p className="text-center py-6 text-gray-500">No tasks yet. Add one above!</p>
        ) : (
          todos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              firebaseServices={firebaseServices}
              userId={userId}
              setError={setError}
            />
          ))
        )}
      </div>
      
      {/* Confirmation modal for clearing completed todos */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleClearCompleted}
        title="Clear completed tasks?"
        message="Are you sure you want to remove all completed tasks? This action cannot be undone."
        confirmText="Clear"
        isProcessing={isClearing}
      />
    </div>
  );
};

export default TodoList;