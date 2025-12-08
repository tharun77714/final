import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <main className="flex flex-col items-center justify-center gap-12 px-8 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">Sparkle Studio</h1>
          <p className="text-xl text-purple-200">Choose your login type</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
          <Link
            href="/login/customer"
            className="flex-1 group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg p-8 transition-all duration-300 hover:bg-white/20 hover:scale-105 border border-white/20"
          >
            <div className="relative z-10">
              <div className="text-4xl mb-4">👤</div>
              <h2 className="text-2xl font-semibold text-white mb-2">For Customers</h2>
              <p className="text-purple-200">Access your customer dashboard</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>

          <Link
            href="/login/vendor"
            className="flex-1 group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg p-8 transition-all duration-300 hover:bg-white/20 hover:scale-105 border border-white/20"
          >
            <div className="relative z-10">
              <div className="text-4xl mb-4">🏪</div>
              <h2 className="text-2xl font-semibold text-white mb-2">For Vendors</h2>
              <p className="text-purple-200">Access your vendor dashboard</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </Link>
        </div>
      </main>
    </div>
  );
}
