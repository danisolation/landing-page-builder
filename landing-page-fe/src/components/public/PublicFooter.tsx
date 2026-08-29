export interface PublicFooterProps {
  pageTitle?: string;
}

export default function PublicFooter({ pageTitle }: PublicFooterProps) {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8" />
        <p className="text-sm">
          &copy; {new Date().getFullYear()} {pageTitle || 'Landing Page'}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
