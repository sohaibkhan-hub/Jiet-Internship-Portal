import React from "react";

function DeleteModel({ open, onClose, onConfirm, title = "Delete", message = "Are you sure you want to delete this item? This action cannot be undone.", confirmText = "Delete", cancelText = "Cancel" }) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
			<div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center animate-fadeIn">
				<div className="mb-4">
					<svg className="w-12 h-12 mx-auto text-red-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2.5 2.5L16 9" />
					</svg>
				</div>
				<div className="text-lg font-semibold text-gray-800 mb-2">{title}</div>
					<div className="text-gray-600 text-sm mb-6 text-center">
						{message ? (
							<span dangerouslySetInnerHTML={{ __html: message }} />
						) : null}
					</div>
				<div className="flex justify-center gap-4">
					<button
						className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
						onClick={onClose}
					>
						{cancelText}
					</button>
					<button
						className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm transition-colors"
						onClick={onConfirm}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}
  
export default DeleteModel;
