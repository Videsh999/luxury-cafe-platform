const TIME_CATEGORIES = [
  { name: 'Morning', start: 8, end: 11 },
  { name: 'Afternoon', start: 12, end: 16 },
  { name: 'Evening', start: 17, end: 22 }
];

const selectedDate = "2026-05-18";

const generateTimeSlots = () => {
  const categories = { 'Morning': [], 'Afternoon': [], 'Evening': [] };
  
  const now = new Date(); // e.g. 2026-05-17T23:30
  
  // Create Date objects in local time by parsing YYYY-MM-DD
  const [y, m, d] = selectedDate.split('-');
  const targetDate = new Date(y, m - 1, d);
  
  // Create today's date normalized to midnight
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // If selected date is strictly in the past, return empty
  if (targetDate < today) {
    return categories;
  }

  const isToday = targetDate.getTime() === today.getTime();

  TIME_CATEGORIES.forEach(cat => {
    for (let h = cat.start; h <= cat.end; h++) {
      ['00', '30'].forEach(minuteStr => {
        if (isToday) {
          const slotTime = new Date();
          slotTime.setHours(h, parseInt(minuteStr), 0, 0);
          if (slotTime <= new Date(now.getTime() + 30 * 60000)) return; // Needs 30 mins lead time
        }
        categories[cat.name].push(`${h.toString().padStart(2, '0')}:${minuteStr}`);
      });
    }
  });
  return categories;
};

console.log(generateTimeSlots());
