import { getProviders, signIn } from 'next-auth/react';

export default async function SignIn() {
  const providers = await getProviders();
  return (
    <div>
      <h1>Sign In</h1>
      {Object.values(providers).map(provider => (
        <div key={provider.name}>
          <button onClick={() => signIn(provider.id)}>Sign in with {provider.name}</button>
        </div>
      ))}
    </div>
  );
}
