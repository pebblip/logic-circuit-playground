// エラーメッセージコンポーネント

import React, { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * エラーメッセージ表示コンポーネント
 */
const ErrorMessage = memo(({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              {error.message}
            </h3>
            {error.details && (
              <p className="mt-1 text-sm text-red-700">
                {error.details}
              </p>
            )}
          </div>
          {onDismiss && (
            <div className="ml-3 flex-shrink-0">
              <button
                onClick={onDismiss}
                className="inline-flex text-red-400 hover:text-red-600 focus:outline-none"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

ErrorMessage.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
    details: PropTypes.string,
    timestamp: PropTypes.string
  }),
  onDismiss: PropTypes.func
};

export default ErrorMessage;