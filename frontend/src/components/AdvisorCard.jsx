import { useState } from "react";

export default function AdvisorCard({ advisor, onClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="bg-white shadow rounded-lg p-4 text-left hover:ring-2 hover:ring-black w-full"
    >
      <div className="flex items-center gap-3">
        {!imgError ? (
          <img
            src={advisor.photo}
            alt={advisor.name}
            className="h-14 w-14 rounded-full object-cover border"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-gray-900 text-white flex items-center justify-center border">
            <span className="font-bold">{advisor.initials}</span>
          </div>
        )}

        <div>
          <p className="font-bold">{advisor.name}</p>
          <p className="text-sm text-gray-600">Click para ver prospectos</p>
        </div>
      </div>
    </button>
  );
}
