import React, { useState } from 'react';

interface BsnlLogoProps {
  logoUrl?: string;
  className?: string;
}

export const BsnlLogo: React.FC<BsnlLogoProps> = ({ logoUrl, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const src = logoUrl || '/assets/bsnl_logo.jpg';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {!imgError && src ? (
        <img
          src={src}
          alt="BSNL Logo"
          className="h-10 w-auto max-w-[50px] object-contain rounded"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#003087] flex items-center justify-center shrink-0 shadow-sm">
          <span
            className="text-white font-black text-xs tracking-tight"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            BSNL
          </span>
        </div>
      )}
      <div>
        <div
          className="text-[#003087] font-bold text-sm leading-tight tracking-tight"
          style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
          BHARAT SANCHAR
        </div>
        <div
          className="text-[#003087] font-bold text-sm leading-tight tracking-tight"
          style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
          NIGAM LIMITED
        </div>
      </div>
    </div>
  );
};
