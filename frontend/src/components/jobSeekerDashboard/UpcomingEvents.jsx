// // import React from "react";
// // import { Target, XCircle } from "lucide-react";
// // import moment from "moment";

// // export default function UpcomingEvents({ events }) {
// //   return (
// //     <section className="bg-white shadow rounded-lg p-6">
// //       <h3 className="font-semibold text-lg mb-4">Upcoming Events</h3>
// // {events.map((ev, i) => (
// //   <li key={i} className="flex items-center justify-between border-b pb-2">
// //     <div className="flex items-center gap-2 text-sm">
// //       {ev.title.toLowerCase().includes("interview") ? (
// //         <span>✅</span>
// //       ) : (
// //         <span>❌</span>
// //       )}

// // <span className="font-semibold capitalize">
// //   {ev.title.includes("🎉") || ev.title.includes("😔")
// //     ? ev.title
// //     : `Interview For ${ev.title} @ ${ev.employerName}`}
// // </span>


// //     </div>

// //     <span className="text-xs text-gray-400">
// //       {moment(ev.date).format("DD MMM YYYY")}
// //     </span>
// //   </li>
// // ))}

// //     </section>
// //   );
// // }

import React from "react";
import moment from "moment";
import { CheckCircle, XCircle, PartyPopper, Clock } from "lucide-react";

export default function UpcomingEvents({ events }) {
  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h3 className="font-semibold text-lg mb-4">📅 Upcoming Events</h3>

      <ul className="relative border-l-2 border-blue-200 pl-4 max-h-[300px] overflow-y-auto">
        {events.map((ev, i) => {
          const isInterview = ev.type === "interview";
          const isHired = ev.type === "hired";
          const isRejected = ev.type === "rejected";

          return (
            <li key={i} className="mb-6 ml-2">
              {/* Timeline Dot */}
              <span className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 border-2 border-white border-solid shadow"></span>

              {/* Event Info */}
              <div className="flex items-center gap-2 text-sm mb-1">
                {isInterview ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : isHired ? (
                  <PartyPopper className="w-4 h-4 text-pink-500" />
                ) : isRejected ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400" />
                )}

                <span className="font-medium">
                  {isInterview
                    ? `Interview for ${ev.jobTitle} @ ${ev.employerName}`
                    : isHired
                    ? `🎉 Hired for ${ev.jobTitle} @ ${ev.employerName}`
                    : isRejected
                    ? `😔 Rejected for ${ev.jobTitle} @ ${ev.employerName}`
                    : ev.title}
                </span>
              </div>

              {/* Date & Mode */}
              <div className="text-xs text-gray-500 ml-6">
                {moment(ev.date).format("DD MMM YYYY, hh:mm A")}
                {isInterview && ev.mode && (
                  <span className="ml-2 text-blue-500 font-semibold">
                    ({ev.mode === "in-person" ? "In-Person" : "Online"})
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

