
import React from 'react';
import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
        <Mail className="h-4 w-4" />
        <span>Need help? Contact us at</span>
        <a 
          href="mailto:help@blocwise.co" 
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          help@blocwise.co
        </a>
      </div>
    </footer>
  );
};

export default Footer;
