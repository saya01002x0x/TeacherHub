import { useState, useEffect } from 'react';
import { Menu, X, Home, Settings, Users, FileText, Bell, ChevronDown, Hash, Video, Lock, RefreshCw } from 'lucide-react';
import CustomChannelPreview from '../components/CustomChannelPreview';

export default function HomePage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [activeChannel, setActiveChannel] = useState(null);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                {/* Header */}
                <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded hover:bg-gray-100"
                        >
                            <Menu size={20} className="text-gray-600" />
                        </button>
                        <div className="flex items-center gap-2">
                            {activeChannel?.data?.private ? (
                                <Lock size={20} className="text-gray-400" />
                            ) : (
                                <Hash size={20} className="text-gray-400" />
                            )}
                            <h2 className="text-lg font-semibold text-gray-900">
                                {activeChannel?.data?.name || activeChannel?.id || 'Select a channel'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded hover:bg-gray-100 relative">
                            <Bell size={18} className="text-gray-600" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <button className="p-2 rounded hover:bg-gray-100">
                            <Video size={18} className="text-gray-600" />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-100"
                            >
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                                    alt="Avatar"
                                    className="w-7 h-7 rounded-full"
                                />
                                <ChevronDown size={16} className={`text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</a>
                                    <hr className="my-1" />
                                    <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</a>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

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
        </div>
    );
}
