export type AdminRow = {
  id: string;
  primary: string;
  secondary: string;
  status: string;
  meta: string;
  action: string;
};

export const adminUsers: AdminRow[] = [
  { id: "USR-2048", primary: "Nadia Ahmad", secondary: "nadia.ahmad@email.com", status: "Active", meta: "12 trips · joined 12 Oct 2026", action: "View profile" },
  { id: "USR-2047", primary: "Amir Rahman", secondary: "amir.r@email.com", status: "Active", meta: "8 trips · joined 10 Oct 2026", action: "View profile" },
  { id: "USR-2046", primary: "Mei Ling", secondary: "mei.ling@email.com", status: "Active", meta: "5 trips · joined 08 Oct 2026", action: "View profile" },
  { id: "USR-2045", primary: "Daniel Lee", secondary: "daniel.lee@email.com", status: "Pending review", meta: "2 trips · joined 06 Oct 2026", action: "Review account" },
  { id: "USR-2044", primary: "Siti Rahman", secondary: "siti.r@email.com", status: "Active", meta: "11 trips · joined 04 Oct 2026", action: "View profile" },
];

export const adminPosts: AdminRow[] = [
  { id: "POST-318", primary: "A weekend in Melaka", secondary: "Nadia Ahmad · Melaka", status: "Published", meta: "128 saves · 14 comments", action: "Review post" },
  { id: "POST-317", primary: "Penang, at your pace", secondary: "Amir Rahman · George Town", status: "Published", meta: "96 saves · 9 comments", action: "Review post" },
  { id: "POST-316", primary: "Sunset walk suggestions", secondary: "Mei Ling · Langkawi", status: "Flagged", meta: "3 reports · 6 comments", action: "Review report" },
  { id: "POST-315", primary: "A softer side of Langkawi", secondary: "Jason Wong · Langkawi", status: "Published", meta: "74 saves · 11 comments", action: "Review post" },
  { id: "POST-314", primary: "Cameron Highlands in two days", secondary: "Farah Noor · Pahang", status: "Pending review", meta: "0 saves · 2 comments", action: "Review post" },
];

export const adminTrips: AdminRow[] = [
  { id: "TRIP-882", primary: "A weekend in Melaka", secondary: "Nadia Ahmad · Melaka", status: "Published", meta: "2 days · 5 stops · rating 4.9", action: "Manage trip" },
  { id: "TRIP-881", primary: "Penang, at your pace", secondary: "Amir Rahman · Penang", status: "Published", meta: "3 days · 4 stops · rating 4.8", action: "Manage trip" },
  { id: "TRIP-880", primary: "A softer side of Langkawi", secondary: "Mei Ling · Kedah", status: "Pending review", meta: "4 days · 3 stops · rating 5.0", action: "Review trip" },
];