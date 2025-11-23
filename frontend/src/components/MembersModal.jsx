import { useState } from "react";
import { X, Plus, Trash2, Check, XCircle, Search, UserPlus } from "lucide-react";

function MembersModal({ members = [], pendingRequests = [], onClose, onAddMember, onRemoveMember, onAcceptRequest, onRejectRequest }) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("members"); // "members" or "requests"

  // Filter members based on search query
  const filteredMembers = members.filter((member) => {
    const name = member.user?.name || member.user?.id || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onAddMember?.(inviteEmail.trim());
      setInviteEmail("");
      setShowInviteForm(false);
    }
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
      onRemoveMember?.(memberId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-900">Quản lý thành viên</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "members"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Thành viên ({members.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "requests"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Yêu cầu ({pendingRequests.length})
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          {/* MEMBERS TAB */}
          {activeTab === "members" && (
            <div className="p-6">
              {/* Search and Add Button */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm thành viên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <UserPlus size={18} />
                  <span>Thêm thành viên</span>
                </button>
              </div>

              {/* Invite Form */}
              {showInviteForm && (
                <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Nhập email thành viên cần mời..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleInvite()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleInvite}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Mời
                    </button>
                    <button
                      onClick={() => {
                        setShowInviteForm(false);
                        setInviteEmail("");
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-2">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? "Không tìm thấy thành viên nào" : "Chưa có thành viên nào"}
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div
                      key={member.user?.id || member.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {member.user?.image ? (
                          <img
                            src={member.user.image}
                            alt={member.user.name || member.user.id}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            <span>
                              {(member.user?.name || member.user?.id || "U").charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.user?.name || member.user?.id || "Unknown User"}
                          </p>
                          {member.user?.email && (
                            <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.user?.id || member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Xóa thành viên"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* REQUESTS TAB */}
          {activeTab === "requests" && (
            <div className="p-6">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Chưa có yêu cầu tham gia nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id || request.user?.id}
                      className="flex items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {request.user?.image ? (
                          <img
                            src={request.user.image}
                            alt={request.user.name || request.user.id}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            <span>
                              {(request.user?.name || request.user?.id || "U").charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {request.user?.name || request.user?.id || "Unknown User"}
                          </p>
                          {request.user?.email && (
                            <p className="text-xs text-gray-500">{request.user.email}</p>
                          )}
                          {request.message && (
                            <p className="text-xs text-gray-600 mt-1 italic">"{request.message}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => onAcceptRequest?.(request.id || request.user?.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
                          title="Chấp nhận"
                        >
                          <Check size={18} />
                          <span>Chấp nhận</span>
                        </button>
                        <button
                          onClick={() => onRejectRequest?.(request.id || request.user?.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
                          title="Từ chối"
                        >
                          <XCircle size={18} />
                          <span>Từ chối</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default MembersModal;
