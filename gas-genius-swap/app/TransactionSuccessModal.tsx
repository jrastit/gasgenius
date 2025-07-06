import React from "react";

export default function TransactionSuccessModal({ fromSymbol, toSymbol, onClose, onShowClearSignin }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#121827] rounded-2xl p-6 w-[360px] text-white text-center shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-white text-xl hover:opacity-70"
        >
          ×
        </button>

        <div className="flex justify-center items-center mb-4">
          <div className="w-16 h-16 rounded-full border-2 border-green-400 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-2">Transaction sent</h2>
        <p className="text-sm text-gray-400 mb-6">Swap of {fromSymbol} to {toSymbol}</p>

        <button
          onClick={onShowClearSignin}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl transition"
        >
          Show Clear Signin
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full bg-gray-700 hover:bg-gray-600 text-sm text-white py-2 rounded-xl transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
