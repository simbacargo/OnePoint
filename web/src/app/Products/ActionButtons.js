"use client";
import Card from '@/components/card';
import Link from 'next/link';
import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

const notify = () => toast.success('Success! Your action was completed.', {
duration: 4000,
position: 'top-center',

// Styling
style: {
backgroundColor: '#10B981', // green-500
color: '#F9FAFB', // grey-50
borderRadius: '0.375rem', // rounded-md
boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
},
className: '',

// Custom Icon
icon: '🎉',

// Aria
ariaProps: {
role: 'status',
'aria-live': 'polite',
},

// Additional Configuration
removeDelay: 1000,

// Toaster instance
toasterId: 'default',
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function simulateDelay() {
    await sleep(1000); // Simulate a delay of 1 second
    notify();
  }  

export default function ActionButtons({ productId }) {
  return (
    <div className="flex gap-2">
      {/* <button onClick={()=>notify()}>Make me a toast</button> */}
      {/* <Toaster /> */}
      <Link href={`/Products/${productId}`} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out">
        <i className="bx bx-dollar text-lg"></i>
        {/* Sell */}
      </Link>
      <Link href={`/Products/${productId}/view`} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out">
        <i className="bx bx-edit text-lg"></i>
        {/* View */}
      </Link> 
      <Link href={`/Products/${productId}/edit`} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-yellow-600 rounded-lg shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out">
        <i className="bx bx-show text-lg"></i>
        {/* Edit */}
      </Link>
      <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out">
        <i className="bx bx-trash text-lg"></i>
        {/* Delete */}
      </button>
    </div>
  );
}
