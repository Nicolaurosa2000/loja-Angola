let counter = 0;

export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  counter = (counter + 1) % 9999;
  const seq = counter.toString().padStart(4, '0');
  return `${year}${month}${day}${seq}`;
}
