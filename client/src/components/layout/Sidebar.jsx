import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
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
  Building2,
  FileDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const { user, logout, isAdmin, isFaculty } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
    { id: 'timetable', label: 'Timetable Grid', icon: Calendar, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
    { id: 'resolver', label: 'Conflict Resolver', icon: Sparkles, badge: true, roles: ['ADMIN', 'FACULTY'] },
    { id: 'export', label: 'Export / Reports', icon: FileDown, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
    { id: 'faculty', label: 'Faculty', icon: Users, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
    { id: 'availability', label: 'Faculty Availability', icon: UserCheck, roles: ['ADMIN', 'FACULTY'] },
    { id: 'sections', label: 'Sections', icon: GraduationCap, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
    { id: 'rooms', label: 'Rooms', icon: DoorClosed, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
    { id: 'timeslots', label: 'Time Slots', icon: Clock, roles: ['ADMIN'] },
    { id: 'history', label: 'Change History', icon: History, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
  ];

  const filteredNav = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : item.roles.includes('VIEWER')
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-gray-950/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 shadow-2xl ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/70">
          {!isCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-white leading-tight font-heading">
                  AutoResolve
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Timetable Engine
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-10 h-10 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Role Badge */}
        <div className={`p-3 mx-3 my-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 ${isCollapsed ? 'text-center p-2 mx-2' : ''}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 border border-indigo-400/30 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-indigo-900/40">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-100 truncate">{user?.name || 'Guest'}</span>
                <span className="text-[10px] font-semibold text-indigo-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  {user?.role || 'VIEWER'}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 border border-indigo-400/30 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-240px)]">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-white scale-110' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 border border-transparent hover:border-rose-500/30 transition-all ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
