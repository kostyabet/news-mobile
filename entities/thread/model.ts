export interface Thread {
  id: number;
  title: string;
  description: string;
  createAt: Date;
}

export interface CreateEditThread {
  title: string;
  description: string;
  createAt: Date;
}