import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endDate));

  useEffect(() => {
    setTimeLeft(getTimeLeft(endDate));
    const interval = setInterval(() => setTimeLeft(getTimeLeft(endDate)), 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-2 text-yellow-300 font-bold text-sm">
        <Clock size={16} /> Sale period ended
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap justify-center">
      <div className="flex items-center gap-1 text-white/70 text-sm">
        <Clock size={14} />
        <span>Sale ends in:</span>
      </div>
      <div className="flex gap-2">
        {[
          { val: timeLeft.days, label: 'Days' },
          { val: timeLeft.hours, label: 'Hrs' },
          { val: timeLeft.minutes, label: 'Min' },
          { val: timeLeft.seconds, label: 'Sec' },
        ].map(({ val, label }) => (
          <div key={label} className="flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-2.5 py-1 min-w-[42px] text-center">
              <span className="text-white font-extrabold text-lg leading-none tabular-nums">
                {String(val).padStart(2, '0')}
              </span>
            </div>
            <span className="text-white/60 text-[10px] font-medium mt-0.5">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTimeLeft(endDate) {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    expired: false,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}
