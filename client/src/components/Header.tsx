import { Link } from "react-router-dom";
import ModeToggle from "./ui/mode-toggle.tsx";

function Header() {
  return (
    <header className="relative flex h-24 w-full items-center justify-between bg-secondary rounded px-3 sm:px-8">
      <Link className="flex items-end gap-2" to="/">
        <img
          src="/src/assets/favicon.ico"
          alt="Wratier logo"
          height={40}
          width={40}
          loading="eager"
          className="rounded-full"
        />
        <h1 className="flex flex-col pb-1 text-xl font-semibold leading-6">
          Wraiter
        </h1>
      </Link>
      <ModeToggle />
    </header>
  );
}

export default Header;
