import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (pathnames.length === 0) return null;

    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
            <Link
                to="/"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
                <Home size={14} />
                <span className="hidden sm:inline">Dashboard</span>
            </Link>

            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                return (
                    <React.Fragment key={to}>
                        <ChevronRight size={14} className="flex-shrink-0" />
                        {last ? (
                            <span className="font-medium text-indigo-400 capitalize">
                                {value.replace(/-/g, ' ')}
                            </span>
                        ) : (
                            <Link
                                to={to}
                                className="hover:text-white transition-colors capitalize"
                            >
                                {value.replace(/-/g, ' ')}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
