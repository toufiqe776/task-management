import React from 'react';
import { MapPin, Paperclip, CloudSun, Calendar, AlertCircle } from 'lucide-react';

export const TaskCard = ({ task, onEdit, onDelete }) => {
  const priorityColors = {
    LOW: 'bg-blue-50 text-blue-700 border-blue-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">{task.title}</h3>
          <span
            className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
              task.status === 'DONE'
                ? 'bg-emerald-100 text-emerald-800'
                : task.status === 'IN_PROGRESS'
                ? 'bg-sky-100 text-sky-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {task.status}
          </span>
        </div>

        {task.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs mb-4">
          <span className={`px-2 py-0.5 rounded border font-medium ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
            {task.priority} Priority
          </span>

          {task.dueDate && (
            <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}

          {task.location && (
            <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              <MapPin className="w-3 h-3 text-red-500" />
              <span>{task.location}</span>
            </div>
          )}

          {task.weather && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
              <CloudSun className="w-3.5 h-3.5 text-blue-500" />
              <span>{task.weather.temp}°C, {task.weather.description}</span>
            </div>
          )}

          {task.fileUrl && (
            <a
              href={task.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-600 hover:underline px-2 py-0.5 bg-indigo-50 rounded"
            >
              <Paperclip className="w-3 h-3" />
              <span>Attachment</span>
            </a>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 text-xs">
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="text-gray-600 hover:text-indigo-600 font-medium px-2 py-1"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(task._id)}
            className="text-rose-600 hover:text-rose-800 font-medium px-2 py-1"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;