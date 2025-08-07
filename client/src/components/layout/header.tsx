import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600 mt-2">{subtitle}</p>
        </div>
        <div className="flex items-center">
          {action}
        </div>
      </div>
    </header>
  );
}
