import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import ConfirmModal from './ConfirmModal';

/**
 * TodoItem component for displaying and managing individual todo items
 * @param {Object} props - Component props
 * @param {Object} props.todo - Todo item data
 * @param {Object} props.firebaseServices - Firebase services (db, auth)
 * @param {string} props.userId - Current user ID
 * @param {Function} props.setError - Function to set error message
 */
const TodoItem = ({ todo, firebaseServices, userId, setError }) => {
  // State variables
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Toggle the completed status of a todo
   */
  const toggleComplete = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      // Get the app ID from global variable or use a default
      const appId = window.__app_id || 'default-app-id';
      
      // Reference to the specific todo document
      const todoRef = doc(
        firebaseServices.db, 
        `artifacts/${appId}/users/${userId}/todos/${todo.id}`
      );
      
      // Update the completed status
      await updateDoc(todoRef, {
        completed: !todo.completed
      });
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update task status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Save edited todo text
   */
  const saveEdit = async () => {
    if (isUpdating) return;
    
    // Validate input
    if (!editText.trim()) {
      setEditText(todo.text); // Reset to original text
      setIsEditing(false);
      return;
    }
    
    // If text hasn't changed, just exit edit mode
    if (editText === todo.text) {
      setIsEditing(false);
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Get the app ID from global variable or use a default
      const appId = window.__app_id || 'default-app-id';
      
      // Reference to the specific todo document
      const todoRef = doc(
        firebaseServices.db, 
        `artifacts/${appId}/users/${userId}/todos/${todo.id}`
      );
      
      // Update the todo text
      await updateDoc(todoRef, { text: editText });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update task text. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle key press events in the edit input
   * @param {Event} e - Keyboard event
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditText(todo.text); // Reset to original text
      setIsEditing(false);
    }
  };

  /**
   * Delete the todo item
   */
  const deleteTodo = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      // Get the app ID from global variable or use a default
      const appId = window.__app_id || 'default-app-id';
      
      // Reference to the specific todo document
      const todoRef = doc(
        firebaseServices.db, 
        `artifacts/${appId}/users/${userId}/todos/${todo.id}`
      );
      
      // Delete the todo document
      await deleteDoc(todoRef);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`flex items-center p-3 border rounded-lg ${todo.completed ? 'bg-gray-50' : 'bg-white'}`}>
      {/* Checkbox for completion status */}
      <div className="flex-shrink-0 mr-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={toggleComplete}
          disabled={isUpdating}
          className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
        />
      </div>
      
      {/* Todo text (editable or display) */}
      <div className="flex-grow">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyPress}
            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
            disabled={isUpdating}
          />
        ) : (
          <span 
            className={`${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
            onDoubleClick={() => !todo.completed && setIsEditing(true)}
          >
            {todo.text}
          </span>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex-shrink-0 ml-2 space-x-1">
        {!isEditing && !todo.completed && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-indigo-600 focus:outline-none p-1"
            title="Edit task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
        
        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-gray-500 hover:text-red-600 focus:outline-none p-1"
          title="Delete task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      {/* Confirmation modal for deleting todo */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteTodo}
        title="Delete task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        isProcessing={isDeleting}
        isDanger
      />
    </div>
  );
};

export default TodoItem;