export function Login() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0b]">
      <h1 className="text-4xl font-bold text-white mb-8">Database Monitor</h1>
      <a
        href={`${import.meta.env.VITE_API_BASE_URL}/api/auth/google-login`}
        className="px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all"
      >
        Sign in with Google
      </a>
    </div>
  );
}
