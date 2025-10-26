// src/components/Sidebar.jsx
"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGlobalContext } from '@/Context/GlobalContext';

const Sidebar = () => {
  // State to manage the current content and active link
  const [mainContent, setMainContent] = useState('');
  const [activeLink, setActiveLink] = useState('Dashboard');
  const {showSidebar} = useGlobalContext();

  // Sample navigation items
  const navItems = [
    { name: 'Dashboard', url: '/', iconClass: 'bi bi-grid' },
    { name: 'Products', url: '/Products/', iconClass: 'bx bxl-product-hunt' },
    { name: 'Sales', url: '/Sales/', iconClass: 'ri-exchange-dollar-fill' },
    { name: 'Sell', url: '/Sell/', iconClass: 'bx bx-cart' },
    // { name: 'Expenses', url: '/Expenses/', iconClass: 'bx bxs-credit-card' },
    { name: 'Customers', url: '/Customers/', iconClass: 'bx bxs-user' },
    // { name: 'Report', url: '/Report/', iconClass: 'bi bi-card-list' },
  ];

  // Function to fetch content from the Django backend
  const fetchContent = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      setMainContent(html);
    } catch (error) {
      console.error('Error fetching content:', error);
      setMainContent("<p style='color: red;'>Failed to load content.</p>");
    }
  };

  // On initial mount, load the dashboard content
  useEffect(() => {
    // fetchContent('/home/'); // Assuming '/home/' is your dashboard URL
  }, []);

  // Handle clicking on a navigation link
  const handleNavLinkClick = (item) => {
    setActiveLink(item.name);
    const djangoUrl = `/home${item.url}`;
    // fetchContent(djangoUrl);
  };

  return (
    <>
    {showSidebar &&
    <aside id="sidebar" className="sidebar">
       <ul className="sidebar-nav" id="sidebar-nav">
        <li className="nav-item">
          <Link
            className={`nav-link ${activeLink === 'Dashboard' ? '' : 'collapsed'}`}
            href="dash"
            onClick={() => handleNavLinkClick({ name: 'Dashboard', url: '/' })}
          >
            <i className="bi bi-grid"></i>
            <span>Dashboard</span>
          </Link>
        </li>

        <li className="nav-heading">Pages</li>

        {navItems.filter((item) => item.name !== 'Dashboard').map((item) => (
          <li className="nav-item" key={item.name}>
            <Link
              className={`nav-link ${activeLink === item.name ? '' : 'collapsed'}`}
              href={item.url}
              // onClick={() => handleNavLinkClick(item)}
            >
              <i className={item.iconClass}></i>
              <span>{item.name}</span>
            </Link>
          </li>
        ))}

        {/* Example for Logout and Collapsible Components Nav */}
        <li className="nav-item">
          <Link href="/logout">
            <div className="nav-link collapsed">
              <i className="ri-logout-box-line"></i>
              <span>LogOut</span>
            </div>
          </Link>
        </li>
{/* 
        <li className="nav-item">
          <a className="nav-link collapsed" data-bs-target="#components-nav" data-bs-toggle="collapse" href="#">
            <i className="bi bi-menu-button-wide"></i><span>Components</span><i className="bi bi-chevron-down ms-auto"></i>
          </a>
          <ul id="components-nav" className="nav-content collapse" data-bs-parent="#sidebar-nav">
            <li><a href="components-alerts.html"><i className="bi bi-circle"></i><span>Alerts</span></a></li>
          </ul>
        </li> */}
      </ul>
    </aside>}</>
  );
};

export default Sidebar;
