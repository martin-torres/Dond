import React from 'react';
import { Card } from './ui/card';

interface ScrollableSidebarProps {
  /** Whether the sidebar is open/expanded */
  isOpen: boolean;
  /** Callback when toggle button is clicked */
  onToggle: () => void;
  /** Width when open (CSS value like '320px', '20vw', etc.) */
  widthOpen?: string;
  /** Width when closed (CSS value) */
  widthClosed?: string;
  /** Fixed header content (toggle button, title, etc.) */
  header: React.ReactNode;
  /** Scrollable content */
  children: React.ReactNode;
  /** Maximum height for scrollable area (default: '300px') */
  maxScrollHeight?: string;
  /** Additional CSS classes for the card */
  className?: string;
}

/**
 * Standardized scrollable sidebar component that maintains static page layout
 * with internal scrolling. Prevents page-level scrolling while allowing
 * content within the sidebar to scroll.
 */
export const ScrollableSidebar: React.FC<ScrollableSidebarProps> = ({
  isOpen,
  onToggle,
  widthOpen = 'clamp(320px, 20vw, 420px)',
  widthClosed = '44px',
  header,
  children,
  maxScrollHeight = '300px',
  className = '',
}) => {
  return (
    <div
      className="h-full flex-shrink-0 overflow-hidden"
      style={{
        width: isOpen ? widthOpen : widthClosed,
        transition: 'width 300ms',
      }}
    >
      <Card className={`h-full overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col ${className}`}>
        <div className="h-full w-full flex flex-col overflow-hidden p-4">
          {/* Fixed header */}
          <div className="flex-shrink-0">
            {header}
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-hidden pt-3">
            {isOpen && (
              <div className="rounded-lg border border-emerald-100 bg-white p-6 shadow-sm">
                <div style={{ maxHeight: maxScrollHeight, overflowY: 'auto' }}>
                  {children}
                </div>
              </div>
            )}

            {isOpen && !children && (
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">No content available.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ScrollableSidebar;
