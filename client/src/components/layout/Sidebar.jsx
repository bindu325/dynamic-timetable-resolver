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
      className={`fixed top-0 left-0 h-screen z-40 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!isCollapsed && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white leading-tight">
                  AutoResolve
                </span>
                <span className="text-[11px] font-medium text-indigo-400">
                  Timetable Engine
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Role Badge */}
        <div className={`px-4 py-3 border-b border-slate-800/60 ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-indigo-300">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Guest'}</span>
                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  {user?.role || 'VIEWER'}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-indigo-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-230px)]">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
