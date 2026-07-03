const Footer = () => {
  return (
    <footer className="py-2 border-t border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-1 text-xs text-ink-600 dark:text-ink-400">
          <span>Designed by</span>
          <span className="font-semibold text-teal-600 dark:text-teal-400">Kevin Achae</span>
        </div>
        <div className="text-center text-[10px] text-ink-500 dark:text-ink-500 mt-0.5">
          © {new Date().getFullYear()} Amana SACCO. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
