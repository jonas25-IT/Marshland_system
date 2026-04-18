import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const CRUDOperations = ({
  data,
  columns,
  onCreate,
  onEdit,
  onDelete,
  onView,
  title,
  createButtonText = "Add New",
  emptyMessage = "No data available",
  showActions = true,
  customActions = []
}) => {
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({});

  const handleCreate = () => {
    setIsCreating(true);
    setEditingItem(null);
    setFormData({});
  };

  const handleEdit = (item) => {
    setIsCreating(false);
    setEditingItem(item);
    setFormData(item);
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        await onCreate(formData);
      } else {
        await onEdit({ ...formData, id: editingItem.id });
      }
      setIsCreating(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete this ${title.toLowerCase()}?`)) {
      try {
        await onDelete(item.id);
        toast.success(`${title} deleted successfully`);
      } catch (error) {
        console.error('Delete failed:', error);
        toast.error(`Failed to delete ${title.toLowerCase()}`);
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderFormField = (column) => {
    const value = formData[column.field] || '';
    
    switch (column.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={column.type}
            value={value}
            onChange={(e) => handleInputChange(column.field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={column.placeholder}
          />
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(column.field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder={column.placeholder}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(column.field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select {column.label}</option>
            {column.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(column.field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleInputChange(column.field, e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(column.field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={column.placeholder}
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {onCreate && (
            <button
              onClick={handleCreate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createButtonText}
            </button>
          )}
        </div>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingItem) && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            {isCreating ? `Create New ${title}` : `Edit ${title}`}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {columns.filter(col => col.editable !== false).map(column => (
              <div key={column.field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {column.label}
                </label>
                {renderFormField(column)}
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isCreating ? 'Create' : 'Update'}
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th key={column.field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.label}
                </th>
              ))}
              {showActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (showActions ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {columns.map(column => (
                    <td key={column.field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(item[column.field], item) : item[column.field]}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {customActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => action.handler(item)}
                            className={action.className}
                            title={action.title}
                          >
                            {action.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CRUDOperations;
