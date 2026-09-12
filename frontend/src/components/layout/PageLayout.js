import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function PageLayout({
  children,
  showSidebar = false,
  activeCategory = 'all',
  onCategoryChange,
  onSearch,
  onFilterChange,
  filters = {},
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-mesh" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onMenuToggle={() => setSidebarOpen(true)}
        onSearch={onSearch}
        onFilterChange={onFilterChange}
        filters={filters}
        showSearch={showSidebar}
        showFilters={showSidebar}
      />

      {showSidebar && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
        />
      )}

      <main style={{ flex: 1 }}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
