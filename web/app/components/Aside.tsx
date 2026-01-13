import React from 'react';
import { Link, useLocation } from 'react-router';

const navItems = [
  { label: 'Dashboard', to: '/', icon: 'bi-grid-1x2' },
  { label: 'Register Product', to: '/register', icon: 'bi-plus-circle' },
  { label: 'Product List', to: '/products', icon: 'bi-list-ul' },
  { label: 'Record Sale', to: '/record-sale', icon: 'bi-cart-plus' },
  { label: 'Sales', to: '/sales', icon: 'bi-graph-up-arrow' },
  { label: 'Verify Sales', to: '/verify', icon: 'bi-patch-check' },
  { label: 'Customers', to: '/customers', icon: 'bi-people' },
];

export default function Aside() {
  const location = useLocation();

  return (
    <aside className="w-72 h-screen flex flex-col bg-whdite p-5">
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Main Menu
        </h2>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <i className={`bi ${item.icon} text-xl`}></i>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="pt-6 border-t border-gray-100">
        <Link 
          to="/profile" 
          className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
        >
          <i className="bi bi-gear text-xl"></i>
          <span className="font-medium">Profile Settings</span>
        </Link>
      </div>
    </aside>
  );
}