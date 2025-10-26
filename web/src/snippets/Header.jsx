"use client";
import Link from 'next/link';
// import { auth, currentUser } from '@clerk/nextjs/server';
import SearchAutocomplete from './SearchAutocomplete'; // Import the client component
import { useGlobalContext } from '@/Context/GlobalContext';

// interface HeaderProps {
//   // These props can still be passed from a parent Server Component or Layout
//   // isLoggedIn: boolean; // We will derive this from Clerk's auth
//   // username?: string; // We will derive this from Clerk's currentUser
//   // dp?: string; // We will derive this from Clerk's currentUser
//   logoutUrl?: string;
//   // setMainContentHtml is removed as it's client-side functionality
// }

const Header = (props) => {
  // const { userId } = await auth();
  // const user = await currentUser();

  // const isLoggedIn = !!userId; // Determine login status
  // const username = user?.fullName || user?.emailAddresses[0]?.emailAddress;
  // const dp = user?.imageUrl;

  const isLoggedIn = true; // Determine login status
  const username = 'John Doe'; // Placeholder for demo purposes
  const dp = '/assets/img/profile-img.jpg'; // Placeholder for demo purposes
  const {showNavbar, setShowNavbar} = useGlobalContext();
  const {showSidebar, setShowSidebar} = useGlobalContext();

  return (
    <>
    {isLoggedIn && (<header id="header" className="header fixed-top d-flex align-items-center">
      <div className="d-flex align-items-center justify-content-between">
        <Link href="/">
          <div className="logo d-flex align-items-center">
            <img src="/assets/img/logo.png" alt="" />
            <span className="d-none d-lg-block">Mesa</span>
          </div>
        </Link>
        <i className="bi bi-list toggle-sidebar-btn" onClick={()=>setShowSidebar(!showSidebar)}></i>
      </div>
      {/* End Logo */}

      {/* Render the Client Component for search and autocomplete */}
      <SearchAutocomplete />
      {/* End Search Bar */}

      <nav className="header-nav ms-auto">
        <ul className="d-flex align-items-center">
          <li className="nav-item d-block d-lg-none">
            <Link href="#">
              <div className="nav-link nav-icon search-bar-toggle">
                <i className="bi bi-search"></i>
              </div>
            </Link>
          </li>
          {/* End Search Icon*/}

          {/* Notifications and Messages dropdowns would go here... */}

          {isLoggedIn && (
            <li className="nav-item dropdown pe-3">
              <a className="nav-link nav-profile d-flex align-items-center pe-0" href="#" data-bs-toggle="dropdown" onClick={() => setShowNavbar(!showNavbar)}>
                <img src={dp || '/assets/img/profile-img.jpg'} alt={username} className="rounded-circle" />
                <span className="d-none d-md-block dropdown-toggle ps-2">{username}</span>
              </a>
              {/* End Profile Image Icon */}

              <ul className={`dropdown-menu dropdown-menu-end dropdown-menu-arrow profile  right-2 top-12  ${showNavbar ? 'show' : ''}`}>
			  
                <li className="dropdown-header">
                  <h6>{username}</h6>
                  <span>Retailer</span>
                </li>
                <li>
                  {/* Clerk provides a Sign Out URL/component, or you can use a custom route */}
                  <a className="dropdown-item d-flex align-items-center" href={props.logoutUrl || '/api/auth/signout'}>
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Sign Out</span>
                  </a>
                </li>
              </ul>
              {/* End Profile Dropdown Items */}
            </li>
          )}
          {/* End Profile Nav */}
        </ul>
      </nav>
      {/* End Icons Navigation */}
    </header>)}
    </>
  );
};

export default Header;
