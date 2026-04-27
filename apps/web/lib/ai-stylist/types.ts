export type StylistChatHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type StylistChatRequest = {
  message?: string;
  history?: StylistChatHistoryMessage[];
  image?: string;
};

export type StylistChatResponse = {
  content: string;
  products: Array<{
    name: string;
    category: string;
    price: number;
    image: string;
    slug: string;
  }>;
};
