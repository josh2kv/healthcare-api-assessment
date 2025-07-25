import axios from 'axios';
import { env } from '@/config/env';

export const api = axios.create({
  baseURL: `${env.VITE_API_URL}${env.VITE_API_URL_PREFIX}`,
  headers: {
    'x-api-key': env.VITE_API_KEY,
  },
});
