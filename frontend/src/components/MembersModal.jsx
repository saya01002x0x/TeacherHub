import { XIcon, SearchIcon, UserPlusIcon, Trash2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useChatContext } from "stream-chat-react";

function MembersModal({ members, channel, onClose, canManageMembers }) {
  const { t } = useTranslation();
  const { client } = useChatContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await client.queryUsers(
        {
          name: { $autocomplete: query },
          id: { $nin: members.map((m) => m.user.id) },
        },
        { name: 1 },
        { limit: 5 }
      );
      setSearchResults(response.users);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      setIsActionLoading(true);
      await channel.addMembers([userId]);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error adding member:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      setIsActionLoading(true);
      await channel.removeMembers([userId]);
    } catch (error) {
      console.error("Error removing member:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">{t("modal.members.title")}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-full transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* SEARCH - Only show if canManageMembers is true */}
          {canManageMembers && (
            <div className="relative mb-6">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder={t("modal.members.search_placeholder")}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* SEARCH RESULTS */}
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-3 text-center text-gray-500 text-sm">Loading...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img src={user.image} alt={user.name} className="size-8 rounded-full object-cover" />
                          ) : (
                            <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                              {(user.name || user.id).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-700">{user.name || user.id}</span>
                        </div>
                        <button
                          onClick={() => handleAddMember(user.id)}
                          disabled={isActionLoading}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                          title={t("modal.members.add")}
                        >
                          <UserPlusIcon className="size-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500 text-sm">{t("common.user_not_found")}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MEMBERS LIST */}
          <div className="mt-2 text-sm text-gray-500 font-medium mb-3">
            {members.length} {t("modal.members.members_count_label")}
          </div>
          <div className="max-h-80 overflow-y-auto -mx-2 px-2 space-y-1">
            {members.map((member) => (
              <div
                key={member.user.id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group transition-colors"
              >
                <div className="flex items-center gap-3">
                  {member.user?.image ? (
                    <img
                      src={member.user.image}
                      alt={member.user.name}
                      className="size-10 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                      {(member.user.name || member.user.id).charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">
                      {member.user.name || member.user.id}
                    </span>
                    <span className="text-xs text-gray-500">
                      {member.user.online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Don't allow removing self, usually */}
                  {/* Also check canManageMembers */}
                  {client.userID !== member.user.id && canManageMembers && (
                    <button
                      onClick={() => handleRemoveMember(member.user.id)}
                      disabled={isActionLoading}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title={t("modal.members.remove")}
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MembersModal;
