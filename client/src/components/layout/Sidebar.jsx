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
  FileDown,
  CalendarDays,
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
      className={`fixed top-0 left-0 h-screen z-40 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 shadow-xs ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm tracking-tight text-slate-900 leading-tight truncate">
                  Dynamic Timetable
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Operations Suite
                </span>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Card */}
        <div className={`p-3 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-200/80 ${isCollapsed ? 'text-center p-2 mx-2' : ''}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-200 shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Guest'}</span>
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  {user?.role || 'VIEWER'}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-200">
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
                  <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
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
                          ? 'bg-teal-50 text-teal-900 border border-teal-200 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
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
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
