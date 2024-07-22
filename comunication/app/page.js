'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Welcome to My App</h1>
      {session ? (
        <div>
          <p>Signed in as {session.user.email}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      ) : (
        <div>
          <p>You are not signed in</p>
          <button onClick={() => signIn()}>Sign in</button>
        </div>
      )}
    </div>
  );
}
