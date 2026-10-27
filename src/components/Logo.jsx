import { Link } from "react-router-dom";
import logoMark from "../assets/bugarhub-logo.png";

function Logo({ tone = "dark", className = "" }) {
  const brandTextColor = tone === "light" ? "text-white" : "text-[#202326]";

  return (
    <Link
      to="/"
      aria-label="BugarHub - Beranda"
      className={`inline-flex shrink-0 items-center gap-2.5 ${className}`}
    >
      <img
        src={logoMark}
        alt=""
        className="h-9 w-11 object-contain sm:h-10 sm:w-12"
      />
      <span className={`text-[21px] font-extrabold tracking-tight sm:text-2xl ${brandTextColor}`}>
        Bugar<span className="text-[#ff6b00]">Hub</span>
      </span>
    </Link>
  );
}

export default Logo;
