import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileCheck,
  User,
  Share2,
  Settings,
  HelpCircle,
  Package,
  Lock
} from 'lucide-react';
import { getCurrentUser } from '../../utils/localStorageService';
import { User as UserType } from '../../types';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  requiresKyc?: boolean;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'My Network',
      path: '/network',
      icon: <Users className="h-5 w-5" />,
      requiresKyc: true
    },
    {
      name: 'Products',
      path: '/products',
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: 'Wallet',
      path: '/wallet',
      icon: <Wallet className="h-5 w-5" />,
      requiresKyc: true
    },
    {
      name: 'KYC Verification',
      path: '/kyc',
      icon: <FileCheck className="h-5 w-5" />,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User className="h-5 w-5" />,
    },
    {
      name: 'Referral Tools',
      path: '/referrals',
      icon: <Share2 className="h-5 w-5" />,
      requiresKyc: true
    },
  ];

  const bottomNavItems: NavItem[] = [
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
    {
      name: 'Help & Support',
      path: '/support',
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isKycApproved = () => {
    return user?.kycStatus === 'approved';
  };

  return (
    <div className="py-6 px-4 h-screen fixed flex flex-col bg-gradient-to-b from-[#2eb6ff] to-[#ff8214]">
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.requiresKyc && !isKycApproved() ? '/kyc' : item.path}
            className={`
              flex items-center px-4 py-2.5 text-sm font-medium rounded-md
              transition-colors duration-200
              ${isActive(item.path)
                ? 'bg-white/30 text-white'
                : 'text-white hover:bg-white/30'
              }
              ${item.requiresKyc && !isKycApproved() ? 'opacity-70' : ''}
            `}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
            {item.requiresKyc && !isKycApproved() && (
              <span className="ml-auto">
                <Lock className="h-3.5 w-3.5 text-white" />
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="pt-6 mt-6 border-t border-neutral-200">
        {bottomNavItems.map((item) => (
          <Link
            key={item.name}
            to={item.requiresKyc && !isKycApproved() ? '/kyc' : item.path}
            className={`
              flex items-center px-4 py-2.5 text-sm font-medium rounded-md
              transition-colors duration-200
              ${isActive(item.path)
                ? 'bg-white/30 text-white'
                : 'text-white hover:bg-white/30'
              }
              ${item.requiresKyc && !isKycApproved() ? 'opacity-70' : ''}
            `}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
            {item.requiresKyc && !isKycApproved() && (
              <span className="ml-auto">
                <Lock className="h-3.5 w-3.5 text-neutral-400" />
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-6 mb-14 px-4 py-4 bg-primary-50 rounded-lg">
        <h3 className="text-sm font-medium text-primary-800">Referral Status</h3>
        <p className="mt-1 text-sm text-primary-600">3 Direct Referrals</p>
        <div className="mt-2 relative pt-1">
          <div className="overflow-hidden h-2 text-xs flex rounded bg-primary-200">
            <div
              style={{ width: "30%" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600"
            ></div>
          </div>
          <p className="mt-1 text-xs text-primary-600">3/10 to next milestone</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;