import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Zap,
  Users,
  GraduationCap,
  BookOpen,
  DoorClosed,
  Clock,
  UserCheck,
  History,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileDown,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const { user, logout, isAdmin, isFaculty } = useAuth();

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
        { id: 'timetable', label: 'Timetable Grid', icon: Calendar, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
      ],
    },
    {
      title: 'SCHEDULING',
      items: [
        { id: 'resolver', label: 'Conflict Resolver', icon: Sparkles, roles: ['ADMIN', 'FACULTY'] },
        { id: 'availability', label: 'Faculty Availability', icon: UserCheck, roles: ['ADMIN', 'FACULTY'] },
        { id: 'timeslots', label: 'Time Slots', icon: Clock, roles: ['ADMIN'] },
      ],
    },
    {
      title: 'ACADEMIC DATA',
      items: [
        { id: 'faculty', label: 'Faculty Directory', icon: Users, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
        { id: 'sections', label: 'Sections', icon: GraduationCap, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
        { id: 'subjects', label: 'Subjects', icon: BookOpen, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
        { id: 'rooms', label: 'Rooms & Labs', icon: DoorClosed, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'history', label: 'Change History', icon: History, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
        { id: 'export', label: 'Export / Reports', icon: FileDown, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-[#f4f0e7] border-r border-[#e5ded2] flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      style={{
        boxShadow: '2px 0 16px rgba(45, 42, 38, 0.04)',
      }}
    >
      {/* Top Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#e5ded2]">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#8c5e47] text-white flex items-center justify-center shrink-0 shadow-sm">
                <CalendarDays className="w-5 h-5 text-[#fdfbf7]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight text-[#2d2a26] leading-tight truncate">
                  Dynamic Timetable
                </span>
                <span className="text-[10px] font-semibold text-[#8a8275] uppercase tracking-wider">
                  Zen Linen Suite
                </span>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-xl bg-[#8c5e47] text-white flex items-center justify-center shadow-sm">
              <CalendarDays className="w-5 h-5 text-[#fdfbf7]" />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-[#8a8275] hover:text-[#2d2a26] hover:bg-[#eae3d5] transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* User Card */}
        <div className={`p-3 mx-3 my-3 rounded-xl bg-[#ffffff] border border-[#e5ded2] ${isCollapsed ? 'text-center p-2 mx-2' : ''}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#faf4ea] text-[#8c5e47] font-bold text-xs flex items-center justify-center border border-[#ebd6b3] shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#2d2a26] truncate">{user?.name || 'Guest'}</span>
                <span className="text-[10px] font-semibold text-[#526b58] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#526b58]" />
                  {user?.role || 'VIEWER'}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-[#faf4ea] text-[#8c5e47] font-bold text-xs flex items-center justify-center border border-[#ebd6b3]" title={user?.name || 'Guest'}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-230px)]">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) =>
              user ? item.roles.includes(user.role) : item.roles.includes('VIEWER')
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#8a8275] uppercase">
                    {group.title}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#ffffff] text-[#8c5e47] border border-[#d8cebf] font-bold shadow-xs'
                          : 'text-[#57524a] hover:text-[#2d2a26] hover:bg-[#eae4d8]'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#8c5e47]' : 'text-[#8a8275]'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-[#e5ded2]">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#a8483f] hover:bg-[#faeceb] border border-transparent hover:border-[#f0c7c3] transition-all cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0 text-[#a8483f]" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
