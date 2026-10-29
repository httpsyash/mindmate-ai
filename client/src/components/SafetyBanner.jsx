import { AlertTriangle, Phone, Users, Headphones } from 'lucide-react';

export function SafetyBanner({ show = true }) {
  if (!show) return null;

  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50">
      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
        <AlertTriangle size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-amber-800">You're not alone</h3>
        <p className="text-amber-700 text-sm mt-1 leading-relaxed">
          If you're feeling overwhelmed or in crisis, please reach out to someone you trust — a friend, family member, counselor, or a qualified professional. In an emergency, contact your local emergency services right away.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Phone size={12} className="text-amber-600" />
            <span className="text-amber-700">Emergency / crisis line</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} className="text-amber-600" />
            <span className="text-amber-700">Trusted person</span>
          </div>
          <div className="flex items-center gap-1">
            <Headphones size={12} className="text-amber-600" />
            <span className="text-amber-700">Mental health professional</span>
          </div>
        </div>
      </div>
    </div>
  );
}
