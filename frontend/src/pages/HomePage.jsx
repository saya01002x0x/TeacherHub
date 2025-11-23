import { useState, useEffect } from 'react';
import { Menu, X, Home, Settings, Users, FileText, Bell, ChevronDown, Hash, Video, Lock, RefreshCw, Plus } from 'lucide-react';
import CustomChannelPreview from '../components/CustomChannelPreview';
import CustomChannelHeader from '../components/CustomChannelHeader';
import MembersModal from '../components/MembersModal';
import CreateChannelModal from '../components/CreateChannelModal';

export default function HomePage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeChannel, setActiveChannel] = useState(null);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
    const [members, setMembers] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);

    const menuItems = [
        { icon: Home, label: 'Dashboard', active: true },
        { icon: Users, label: 'Users' },
        { icon: FileText, label: 'Documents' },
        { icon: Settings, label: 'Settings' },
    ];

    // Mock data loading
    useEffect(() => {
        const loadChannels = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const mockChannels = [
                    {
                        id: 'general',
                        data: { name: 'general', private: false, member_count: 15 },
                        countUnread: () => 3,
                        state: { members: {} },
                        _client: { user: { id: 'current-user' } }
                    },
                    {
                        id: 'random',
                        data: { name: 'random', private: false, member_count: 8 },
                        countUnread: () => 0,
                        state: { members: {} },
                        _client: { user: { id: 'current-user' } }
                    },
                    {
                        id: 'private-team',
                        data: { name: 'private-team', private: true, member_count: 5 },
                        countUnread: () => 1,
                        state: { members: {} },
                        _client: { user: { id: 'current-user' } }
                    }
                ];
                
                setChannels(mockChannels);
                setActiveChannel(mockChannels[0]); // Set general as default
            } catch (err) {
                console.error('Failed to load channels:', err);
                setError('Failed to load channels');
            } finally {
                setLoading(false);
            }
        };
        
        loadChannels();
    }, []);

    const handleChannelSelect = (channel) => {
        setActiveChannel(channel);
    };

    const handleRetry = () => {
        setChannels([]);
        setLoading(true);
        setError(null);
        // Trigger re-load
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    const handleMemberCountClick = () => {
        setShowMembersModal(true);
    };

    // Load members when channel changes
    useEffect(() => {
        if (activeChannel) {
            const memberCount = activeChannel.data?.member_count || 0;
            const channelMembers = [];
            
            for (let i = 0; i < memberCount; i++) {
                channelMembers.push({
                    user: {
                        id: `user-${i + 1}`,
                        name: `User ${i + 1}`,
                        email: `user${i + 1}@example.com`,
                        image: i % 2 === 0 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=User${i + 1}` : undefined
                    }
                });
            }
            
            setMembers(channelMembers);
            
            // Mock pending requests (2-3 requests)
            const mockRequests = [
                {
                    id: 'req-1',
                    user: {
                        id: 'pending-1',
                        name: 'Nguyễn Văn A',
                        email: 'nguyenvana@example.com',
                        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pending1'
                    },
                    message: 'Xin chào, tôi muốn tham gia channel này'
                },
                {
                    id: 'req-2',
                    user: {
                        id: 'pending-2',
                        name: 'Trần Thị B',
                        email: 'tranthib@example.com',
                        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pending2'
                    },
                    message: 'Có thể cho tôi tham gia không?'
                }
            ];
            setPendingRequests(mockRequests);
        }
    }, [activeChannel]);

    // Handlers for MembersModal
    const handleAddMember = (email) => {
        const newMember = {
            user: {
                id: `user-${Date.now()}`,
                name: email.split('@')[0],
                email: email,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
            }
        };
        setMembers([...members, newMember]);
        
        // Update channel member count
        if (activeChannel) {
            setActiveChannel({
                ...activeChannel,
                data: {
                    ...activeChannel.data,
                    member_count: (activeChannel.data?.member_count || 0) + 1
                }
            });
        }
        
        console.log('Added member:', email);
    };

    const handleRemoveMember = (memberId) => {
        setMembers(members.filter(m => (m.user?.id || m.id) !== memberId));
        
        // Update channel member count
        if (activeChannel) {
            setActiveChannel({
                ...activeChannel,
                data: {
                    ...activeChannel.data,
                    member_count: Math.max(0, (activeChannel.data?.member_count || 0) - 1)
                }
            });
        }
        
        console.log('Removed member:', memberId);
    };

    const handleAcceptRequest = (requestId) => {
        const request = pendingRequests.find(r => (r.id || r.user?.id) === requestId);
        if (request) {
            // Add to members
            setMembers([...members, { user: request.user }]);
            
            // Remove from pending requests
            setPendingRequests(pendingRequests.filter(r => (r.id || r.user?.id) !== requestId));
            
            // Update channel member count
            if (activeChannel) {
                setActiveChannel({
                    ...activeChannel,
                    data: {
                        ...activeChannel.data,
                        member_count: (activeChannel.data?.member_count || 0) + 1
                    }
                });
            }
            
            console.log('Accepted request:', requestId);
        }
    };

    const handleRejectRequest = (requestId) => {
        setPendingRequests(pendingRequests.filter(r => (r.id || r.user?.id) !== requestId));
        console.log('Rejected request:', requestId);
    };

    const handleCreateChannel = async (channelData) => {
        // Create new channel object
        const newChannel = {
            id: channelData.id,
            data: {
                name: channelData.name,
                private: channelData.private,
                member_count: channelData.member_count || 1,
                description: channelData.description,
            },
            countUnread: () => 0,
            state: { members: {} },
            _client: { user: { id: 'current-user' } }
        };

        // Add to channels list
        setChannels([...channels, newChannel]);
        
        // Set as active channel
        setActiveChannel(newChannel);
        
        console.log('Channel created:', channelData);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar - 30% */}
            <aside className={`
                w-full lg:w-[30%] bg-white border-r border-gray-200 flex flex-col
                fixed lg:relative inset-y-0 left-0 z-30
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Sidebar Header */}
                <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded hover:bg-gray-100"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">TeacherHub</h1>
                    </div>
                    <button className="p-2 rounded hover:bg-gray-100">
                        <Settings size={18} className="text-gray-600" />
                    </button>
                </div>

                {/* Create Channel Button */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <button
                        onClick={() => setShowCreateChannelModal(true)}
                        className="flex items-center gap-2 w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Channel</span>
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Channel List Section */}
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Channels</h3>
                        
                        {/* Loading State */}
                        {loading && (
                            <div className="animate-pulse space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-3">
                                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded flex-1"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Error State */}
                        {error && !loading && (
                            <div className="text-center py-3">
                                <p className="text-red-600 text-sm mb-2">{error}</p>
                                <button
                                    onClick={handleRetry}
                                    className="flex items-center justify-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 mx-auto"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    Retry
                                </button>
                            </div>
                        )}
                        
                        {/* Channels List */}
                        {!loading && !error && (
                            <>
                                <div className="mb-4">
                                    <div className="space-y-1">
                                        {channels.map(channel => (
                                            <CustomChannelPreview
                                                key={channel.id}
                                                channel={channel}
                                                activeChannel={activeChannel}
                                                setActiveChannel={handleChannelSelect}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/* Navigation Menu */}
                    <div className="p-4">
                        <nav className="space-y-1">
                        {menuItems.map((item, idx) => (
                            <a
                                key={idx}
                                href="#"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                    item.active
                                        ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <item.icon size={20} className={item.active ? 'text-indigo-600' : ''} />
                                <span className="font-medium">{item.label}</span>
                            </a>
                        ))}
                        </nav>
                    </div>
                </div>

                {/* Sidebar Footer - User Info */}
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                            alt="User"
                            className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                            <p className="text-xs text-gray-500">Active</p>
                        </div>
                        <button className="p-1.5 rounded hover:bg-gray-200">
                            <ChevronDown size={16} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content - 70% */}
            <div className="flex-1 lg:w-[70%] flex flex-col overflow-hidden">
                {/* Header with mobile menu button */}
                <div className="lg:hidden h-14 border-b border-gray-200 bg-white flex items-center px-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded hover:bg-gray-100 mr-3"
                    >
                        <Menu size={20} className="text-gray-600" />
                    </button>
                    <span className="font-medium text-gray-700">TeacherHub</span>
                </div>
                
                {/* Custom Channel Header */}
                <CustomChannelHeader 
                    channel={activeChannel} 
                    onMemberCountClick={handleMemberCountClick}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="max-w-4xl mx-auto p-6">
                        {/* Welcome Section */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Welcome to #general 👋
                            </h1>
                            <p className="text-gray-600">This is the start of the #general channel.</p>
                        </div>

                        {/* Messages/Content Area */}
                        <div className="space-y-4">
                            {[
                                { user: 'Alice Johnson', message: 'Hello everyone! Welcome to TeacherHub!', time: '10:30 AM', avatar: 'A' },
                                { user: 'Bob Smith', message: 'Great to be here! Looking forward to collaborating.', time: '10:32 AM', avatar: 'B' },
                                { user: 'Charlie Brown', message: 'This platform looks amazing! 🎉', time: '10:35 AM', avatar: 'C' },
                            ].map((msg, idx) => (
                                <div key={idx} className="flex gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold shrink-0">
                                        {msg.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-900">{msg.user}</span>
                                            <span className="text-xs text-gray-500">{msg.time}</span>
                                        </div>
                                        <p className="text-gray-700">{msg.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Input Area */}
                <div className="border-t border-gray-200 bg-white p-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Message #general"
                                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded hover:bg-gray-200">
                                    <FileText size={18} className="text-gray-400" />
                                </button>
                            </div>
                            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Members Modal */}
            {showMembersModal && (
                <MembersModal 
                    members={members}
                    pendingRequests={pendingRequests}
                    onClose={() => setShowMembersModal(false)}
                    onAddMember={handleAddMember}
                    onRemoveMember={handleRemoveMember}
                    onAcceptRequest={handleAcceptRequest}
                    onRejectRequest={handleRejectRequest}
                />
            )}

            {/* Create Channel Modal */}
            {showCreateChannelModal && (
                <CreateChannelModal 
                    onClose={() => setShowCreateChannelModal(false)}
                    onCreateChannel={handleCreateChannel}
                />
            )}
        </div>
    );
}
