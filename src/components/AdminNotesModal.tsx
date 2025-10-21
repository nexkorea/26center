import React, { useState } from 'react';

interface AdminNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  currentNotes?: string;
  companyName: string;
  action: 'approve' | 'reject';
}

const AdminNotesModal: React.FC<AdminNotesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentNotes = '',
  companyName,
  action
}) => {
  const [notes, setNotes] = useState(currentNotes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(notes);
    onClose();
  };

  const handleClose = () => {
    setNotes(currentNotes); // 원래 값으로 리셋
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className={`text-white p-6 rounded-t-2xl ${
          action === 'approve' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-red-500 to-rose-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {action === 'approve' ? '승인 메모' : '반려 메모'}
              </h2>
              <p className="text-white text-opacity-90 text-sm mt-1">{companyName}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-2">
              {action === 'approve' ? '승인 메모' : '반려 사유'}
            </label>
            <textarea
              id="adminNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={action === 'approve' 
                ? '승인 관련 메모를 입력하세요...' 
                : '반려 사유를 입력하세요...'
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
              rows={4}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              {notes.length}/500자
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
            >
              취소
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                action === 'approve'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
              }`}
            >
              {action === 'approve' ? '승인' : '반려'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminNotesModal;
