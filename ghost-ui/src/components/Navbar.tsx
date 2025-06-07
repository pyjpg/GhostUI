import { BiLogoReact } from 'react-icons/bi';
import { Link } from 'react-router-dom';

type NavbarProps = {
  title: string;
};

const Navbar = ({ title }: NavbarProps) => {
  return (
    <header className="bg-white dark:bg-zinc-900 shadow-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-zinc-900 dark:text-white hover:opacity-80">
          <BiLogoReact className="w-6 h-6 text-blue-600" />
          {title}
        </Link>
       <nav className="flex gap-6 text-sm text-zinc-600 dark:text-zinc-400">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
        <Link to="/docs/govuk-guide" className="hover:text-blue-600 dark:hover:text-blue-400">Gov UK Guide</Link>
        <Link to="/docs/ElecSafeP" className="hover:text-blue-600 dark:hover:text-blue-400">Electrical safety - Dwellings</Link>
        <Link to="/docs/ADF1" className="hover:text-blue-600 dark:hover:text-blue-400">Volume 1: Dwellings</Link>
      </nav>
      </div>
    </header>
  );
};

export default Navbar;