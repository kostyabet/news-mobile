import { Thread } from "@/entities/thread/model";

const THREAD_DATA: Thread[] = [
  { id: 0, title: "USA", description: "USA" },
  { id: 1, title: "Russia", description: "Russia" },
  { id: 2, title: "Belarus", description: "Belarus" },
  { id: 3, title: "Danmark", description: "Danmark" },
  { id: 4, title: "Sweden", description: "Sweden" },
  { id: 5, title: "USA", description: "USA" },
  { id: 6, title: "Russia", description: "Russia" },
  { id: 7, title: "Belarus", description: "Belarus" },
  { id: 8, title: "Danmark", description: "Danmark" },
  { id: 9, title: "Sweden", description: "Sweden" },
  { id: 10, title: "USA", description: "USA" },
  { id: 11, title: "Russia", description: "Russia" },
  { id: 12, title: "Belarus", description: "Belarus" },
  { id: 13, title: "Danmark", description: "Danmark" },
  { id: 14, title: "Sweden", description: "Sweden" },
  { id: 15, title: "USA", description: "USA" },
  { id: 16, title: "USA", description: "USA" },
  { id: 17, title: "USA", description: "USA" },
  { id: 18, title: "USA", description: "USA" },
  { id: 19, title: "USA", description: "USA" },
  { id: 20, title: "USA", description: "USA" },
  { id: 21, title: "USA", description: "USA" },
  { id: 22, title: "USA", description: "USA" },
  { id: 23, title: "USA", description: "USA" },
  { id: 24, title: "USA", description: "USA" },
];

export const fetchGetThreads = (): Thread[] => {
  return THREAD_DATA;
};

export const fetchFilterThreads = (search: string): Thread[] => {
  return THREAD_DATA.filter((thread) =>
    thread.title.toLowerCase().includes(search.toLowerCase()),
  );
};
