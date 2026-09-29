import React, { useState } from 'react';
import { UserProfile, MarketZone } from '../types';
import { User, MapPin, SwitchCamera, Check, Edit3, X, Sparkles } from 'lucide-react';

interface UserProfileBarProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  zones: MarketZone[];
  onRoleSwitch: (role: 'farmer' | 'buyer' | 'academic') => void;
}

export const UserProfileBar: React.FC<UserProfileBarProps> = ({
  userProfile,
  onUpdateProfile,
  zones,
  onRoleSwitch,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);
  const [tempDistrict, setTempDistrict] = useState(userProfile.districtId);
  const [tempRole, setTempRole] = useState<'farmer' | 'buyer' | 'academic'>(userProfile.role);

  const activeZone = zones.find((z) => z.zoneId === userProfile.districtId) || zones[0];

  const handleOpenModal = () => {
    setTempName(userProfile.name);
    setTempDistrict(userProfile.districtId);
    setTempRole(userProfile.role);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const targetZone = zones.find((z) => z.zoneId === tempDistrict) || activeZone;
    onUpdateProfile({
      ...userProfile,
      name: tempName.trim() || 'Agricultural Trader',
      role: tempRole,
      state: targetZone?.state || userProfile.state || 'India',
      districtId: tempDistrict,
    });
    onRoleSwitch(tempRole);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#FAF7EE] border-b border-[#E2DAC5] px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        {/* Left: Active Session Information */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-[#1B4332]">
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse"></span>
            <User className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Active Session:</span>
          </div>

          <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-[#D8CDB2] shadow-2xs">
            <span className="font-bold text-[#1B4332]">{userProfile.name}</span>
            <span className="text-[#8C7A5B]">&bull;</span>
            <span className="flex items-center gap-1 text-[#264653] font-semibold">
              <MapPin className="w-3 h-3 text-[#2D6A4F]" />
              <span>{activeZone.districtRegion}</span>
            </span>
            <span className="text-[#8C7A5B]">&bull;</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              userProfile.role === 'farmer' 
                ? 'bg-[#2D6A4F]/15 text-[#1B4332]' 
                : 'bg-[#264653]/15 text-[#264653]'
            }`}>
              {userProfile.role === 'farmer' ? '🌾 Farmer View' : '🛒 Buyer View'}
            </span>
          </div>

          <button
            onClick={handleOpenModal}
            className="text-[11px] text-[#2D6A4F] hover:text-[#1B4332] font-bold underline cursor-pointer flex items-center gap-1 transition"
            title="Edit User Name or District"
          >
            <Edit3 className="w-3 h-3" />
            <span>Change Profile / District</span>
          </button>
        </div>

        {/* Right: Quick Role Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#52796F] font-semibold hidden md:inline">
            Quick Switch:
          </span>
          <div className="inline-flex bg-[#EAE6D6] p-0.5 rounded-lg border border-[#D8CDB2]">
            <button
              onClick={() => {
                onRoleSwitch('farmer');
                onUpdateProfile({ ...userProfile, role: 'farmer' });
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                userProfile.role === 'farmer'
                  ? 'bg-[#2D6A4F] text-white shadow-2xs'
                  : 'text-[#1B4332] hover:bg-[#FAF7EE]'
              }`}
            >
              <span>🌾</span>
              <span>Farmer</span>
            </button>
            <button
              onClick={() => {
                onRoleSwitch('buyer');
                onUpdateProfile({ ...userProfile, role: 'buyer' });
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                userProfile.role === 'buyer'
                  ? 'bg-[#264653] text-white shadow-2xs'
                  : 'text-[#264653] hover:bg-[#FAF7EE]'
              }`}
            >
              <span>🛒</span>
              <span>Buyer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile & District Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#2D6A4F] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E2DAC5] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#2D6A4F]/10 text-[#2D6A4F]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B4332]">
                    Session Profile Setup
                  </h3>
                  <p className="text-[11px] text-[#52796F]">
                    Tracks your active identity and Andhra Pradesh home district
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#FAF7EE] text-[#52796F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1">
                  User / Organization Name:
                </label>
                <input
                  type="text"
                  required
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="e.g., K. Sambasiva Rao / Amaravati Agro"
                  className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl px-3 py-2 font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none"
                />
              </div>

              {/* District Location Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1">
                  Location (Andhra Pradesh District):
                </label>
                <select
                  value={tempDistrict}
                  onChange={(e) => setTempDistrict(e.target.value)}
                  className="w-full bg-[#FAF7EE] border border-[#D8CDB2] rounded-xl px-3 py-2 font-semibold text-[#1B4332] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-none cursor-pointer"
                >
                  {zones.map((z) => (
                    <option key={z.zoneId} value={z.zoneId}>
                      {z.districtRegion} ({z.zoneName})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-[#52796F] mt-1 block">
                  Used by Dijkstra's shortest path routing to compute freight transit distances.
                </span>
              </div>

              {/* Default Role */}
              <div>
                <label className="block text-xs font-bold text-[#1B4332] mb-1">
                  Default View / Role:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTempRole('farmer')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      tempRole === 'farmer'
                        ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-xs'
                        : 'bg-[#FAF7EE] text-[#1B4332] border-[#D8CDB2] hover:bg-[#F4F1DE]'
                    }`}
                  >
                    <span>🌾</span>
                    <span>Farmer View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempRole('buyer')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      tempRole === 'buyer'
                        ? 'bg-[#264653] text-white border-[#264653] shadow-xs'
                        : 'bg-[#FAF7EE] text-[#1B4332] border-[#D8CDB2] hover:bg-[#F4F1DE]'
                    }`}
                  >
                    <span>🛒</span>
                    <span>Buyer View</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2DAC5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#52796F] hover:bg-[#FAF7EE] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Session Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
