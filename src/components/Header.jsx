import { Link } from 'react-router-dom'

function Header({ isLoggedIn, user, isStaff, onLogout }) {
    return (
        <header className="border-b border-rose-100/40 bg-gradient-to-r from-white/80 via-white/75 to-rose-50/50 backdrop-blur-md sticky top-0 z-50 shadow-sm">
            <nav className="mx-auto max-w-6xl px-4 py-3.5 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-8">
                    <Link 
                        to="/" 
                        className="flex items-center gap-2 hover:opacity-80 transition group"
                    >
                        <div className="inline-flex rounded-full border border-rose-200/60 bg-gradient-to-br from-rose-50 to-pink-50/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-rose-600 shadow-sm group-hover:shadow-md transition">
                             5-19 Library
                        </div>
                    </Link>

                    <div className="flex items-center gap-8">
                        {isLoggedIn && (
                            <div className="flex items-center gap-8 border-r border-rose-100/40 pr-8">
                                <Link
                                    to="/books"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700 hover:text-rose-900 transition relative group"
                                >
                                    <span>Номы</span>
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-400 to-pink-400 transition-all group-hover:w-full"></span>
                                </Link>
                                <Link
                                    to="/loans"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700 hover:text-rose-900 transition relative group"
                                >
                                    <span>Зээлэлт</span>
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-400 to-pink-400 transition-all group-hover:w-full"></span>
                                </Link>
                            </div>
                        )}

                        {isLoggedIn ? (
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className="hidden sm:block text-right">
                                    <p className="text-xs uppercase tracking-[0.22em] text-rose-400/80 font-medium">
                                        {isStaff ? '👤 Staff' : '👤 Member'}
                                    </p>
                                    <p className="text-sm font-semibold text-rose-900 truncate max-w-xs">{user?.email}</p>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="rounded-full border border-rose-200/70 bg-white/80 backdrop-blur px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50/80 hover:border-rose-300 transition shadow-sm hover:shadow-md"
                                >
                                    Гарах
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Header
