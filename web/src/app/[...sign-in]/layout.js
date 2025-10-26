// app/login/page.jsx (or similar client component)

export default function LoginPage() {
  return (
    <a href="/api/auth/google/login">
      <button>Login with Google</button>
    </a>
  );
}