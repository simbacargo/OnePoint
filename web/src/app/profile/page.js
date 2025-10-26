// app/profile/page.js (Server Component)

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ⚠️ MOCK FUNCTION: In a real application, this function would 
// connect to your database (e.g., Prisma, Drizzle) to find the user 
// associated with the Google 'sub' ID (which is stored in sessionId).
async function getUserProfile(googleSubId) {
  // Replace this with a real DB query: 
  // const user = await db.user.findUnique({ where: { googleSubId } });
  
  // Mock data based on the Google ID being present
  if (googleSubId) {
    return {
      id: googleSubId,
      name: 'Jane Doe', // Replace with real data from your database
      email: 'jane.doe@example.com', // Replace with real data from your database
      isPremium: Math.random() > 0.5, // Example of custom user data
    };
  }
  return null;
}

export default async function ProfilePage() {
  const sessionId = cookies().get('session_id')?.value;

  if (!sessionId) {
    // 1. Redirect unauthenticated users
    redirect('/login');
  }

  // 2. Use the sessionId (Google 'sub') to fetch the full user profile
  const user = await getUserProfile(sessionId);

  if (!user) {
    // Optionally handle case where session ID exists but user is not in DB
    // e.g., clear the cookie and redirect to login
    redirect('/login');
  }

  return (
    <div className="p-8 max-w-lg mx-auto bg-white shadow-xl rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Profile</h1>

      <div className="space-y-4">
        <p className="text-lg">
          <span className="font-semibold text-gray-700">Welcome back,</span> {user.name}! 👋
        </p>

        <div className="border-t pt-4 space-y-2">
          <p>
            <span className="font-semibold block text-sm text-gray-600">Google ID (Sub):</span>
            <code className="bg-gray-100 p-1 rounded text-sm text-purple-600 break-all">{user.id}</code>
          </p>
          <p>
            <span className="font-semibold block text-sm text-gray-600">Email:</span>
            <span className="text-blue-600">{user.email}</span>
          </p>
          <p>
            <span className="font-semibold block text-sm text-gray-600">Status:</span>
            <span className={`font-bold ${user.isPremium ? 'text-green-600' : 'text-yellow-600'}`}>
              {user.isPremium ? 'Premium User ⭐' : 'Standard User'}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-8">
        {/* Link to a separate API route (e.g., /api/auth/logout) to clear the session cookie */}
        <a 
          href="/api/auth/logout" 
          className="inline-block px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150"
        >
          Logout
        </a>
      </div>
    </div>
  );
}