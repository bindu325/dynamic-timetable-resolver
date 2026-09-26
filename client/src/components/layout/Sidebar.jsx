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
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const { user, logout, isAdmin, isFaculty } = useAuth();

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
      ],
    },
    {
      label: 'Scheduling',
      items: [
        { id: 'create-timetable', label: 'Create Timetable', icon: Sparkles, roles: ['ADMIN'] },
        { id: 'timetable', label: 'Timetable', icon: Calendar, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
        { id: 'resolver', label: 'Conflict Resolver', icon: Zap, badge: true, roles: ['ADMIN', 'FACULTY'] },
        { id: 'export', label: 'Export & Reports', icon: FileDown, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
      ],
    },
    {
      label: 'Resources',
      items: [
        { id: 'faculty', label: 'Faculty', icon: Users, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
        { id: 'availability', label: 'Availability', icon: UserCheck, roles: ['ADMIN', 'FACULTY'] },
        { id: 'sections', label: 'Sections', icon: GraduationCap, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
        { id: 'subjects', label: 'Subjects', icon: BookOpen, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
        { id: 'rooms', label: 'Rooms', icon: DoorClosed, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
        { id: 'timeslots', label: 'Time Slots', icon: Clock, roles: ['ADMIN'] },
      ],
    },
    {
      label: 'System',
      items: [
        { id: 'history', label: 'Change History', icon: History, roles: ['ADMIN', 'FACULTY', 'VIEWER'] },
      ],
    },
  ];

  const userRole = user?.role || 'VIEWER';

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-[68px]' : 'w-60'
      }`}
      style={{
        background: 'rgba(7, 13, 30, 0.92)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        borderRight: '1px solid rgba(79, 70, 229, 0.18)',
        boxShadow: '4px 0 40px rgba(0,0,0,0.50), inset -1px 0 0 rgba(79,70,229,0.08)',
      }}
    >
      {/* Top section */}
      <div>
        {/* Brand Header */}
        <div
          className="flex items-center justify-between px-3 py-4"
          style={{ borderBottom: '1px solid rgba(79,70,229,0.12)' }}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
              {/* 3D Logo Mark */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(145deg, #6366f1 0%, #4f46e5 100%)',
                  boxShadow: '0 3px 0 rgba(40,33,160,0.50), 0 6px 16px rgba(79,70,229,0.35), inset 0 1px 0 rgba(255,255,255,0.20)',
                }}
              >
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  className="text-sm font-bold tracking-tight leading-tight truncate"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#f0f4ff' }}
                >
                  AutoResolve
                </span>
                <span className="text-[10px] font-medium leading-tight" style={{ color: 'var(--text-muted)' }}>
                  Timetable Engine
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div
              className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #6366f1 0%, #4f46e5 100%)',
                boxShadow: '0 3px 0 rgba(40,33,160,0.50), 0 6px 16px rgba(79,70,229,0.35), inset 0 1px 0 rgba(255,255,255,0.20)',
              }}
            >
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-md transition-all shrink-0"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'rgba(79,70,229,0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* User Identity */}
        {!isCollapsed && (
          <div
            className="mx-3 my-3 px-3 py-2.5 rounded-xl flex items-center gap-2.5"
            style={{
              background: 'rgba(79,70,229,0.08)',
              border: '1px solid rgba(79,70,229,0.18)',
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
              style={{
                background: 'linear-gradient(145deg, #6366f1 0%, #4f46e5 100%)',
                boxShadow: '0 2px 0 rgba(40,33,160,0.40), 0 4px 12px rgba(79,70,229,0.25)',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.name || 'Guest User'}
              </span>
              <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <ShieldCheck className="w-2.5 h-2.5" style={{ color: 'var(--indigo-light)' }} />
                {userRole}
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="flex justify-center py-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                background: 'linear-gradient(145deg, #6366f1 0%, #4f46e5 100%)',
                boxShadow: '0 2px 0 rgba(40,33,160,0.40), 0 4px 12px rgba(79,70,229,0.25)',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="px-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(item => item.roles.includes(userRole));
            if (!visibleItems.length) return null;
            return (
              <div key={group.label} className="mb-1">
                {!isCollapsed && (
                  <div
                    className="px-2 py-2 text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: 'var(--text-faint)', fontFamily: "'Inter', sans-serif" }}
                  >
                    {group.label}
                  </div>
                )}
                {isCollapsed && <div className="pt-2" />}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-2' : ''}`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon
                          className="nav-icon w-4 h-4 shrink-0"
                          style={{ color: isActive ? '#818cf8' : 'var(--text-muted)' }}
                        />
                        {!isCollapsed && (
                          <span className="truncate text-[13px]">{item.label}</span>
                        )}
                        {!isCollapsed && isActive && (
                          <span
                            className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: '#6366f1' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div
        className="p-2"
        style={{ borderTop: '1px solid rgba(79,70,229,0.12)' }}
      >
        <button
          onClick={logout}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.10)';
            e.currentTarget.style.color = '#fca5a5';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.20)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
