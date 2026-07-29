import React, { useState, useEffect } from 'react';
import { UserCheck, Award, CheckCircle2, CheckCheck, TrendingUp, Briefcase, Calendar, FileText } from 'lucide-react';
import { fetchMemberTimeline } from '../../services/enterpriseApi';

const iconMap = {
  UserCheck: <UserCheck className="w-5 h-5 text-indigo-600" />,
  Award: <Award className="w-5 h-5 text-amber-600" />,
  CheckCircle2: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
  CheckCheck: <CheckCheck className="w-5 h-5 text-teal-600" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-purple-600" />,
  Briefcase: <Briefcase className="w-5 h-5 text-blue-600" />,
  FileText: <FileText className="w-5 h-5 text-slate-600" />,
};

export default function MemberTimelineView({ memberId = 1 }) {
  const [timeline, setTimeline] = useState(null);

  useEffect(() => {
    fetchMemberTimeline(memberId).then(setTimeline);
  }, [memberId]);

  if (!timeline) return <div className="p-4 text-slate-500">Loading timeline...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="border-b pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Member Lifecycle Timeline</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological history of {timeline.memberName} ({timeline.memberNo})
          </p>
        </div>
        <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-extrabold rounded-full">
          {timeline.eventsCount} Milestones
        </span>
      </div>

      {/* Vertical Interactive Timeline */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.events?.map((evt, idx) => (
          <div key={idx} className="relative flex items-start gap-4 group">
            {/* Circle Node */}
            <div className="absolute -left-6 top-1 w-7 h-7 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition duration-200">
              {iconMap[evt.icon] || <Calendar className="w-3.5 h-3.5 text-indigo-600" />}
            </div>

            {/* Event Card */}
            <div className="flex-1 bg-slate-50 border border-slate-200/80 hover:border-indigo-300 p-4 rounded-xl shadow-xs transition duration-150">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-black uppercase text-indigo-700 px-2 py-0.5 bg-indigo-100 rounded">
                  {evt.year}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{evt.date}</span>
              </div>
              <h4 className="text-md font-bold text-slate-900">{evt.title}</h4>
              <p className="text-xs text-slate-600 mt-1 font-medium">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
