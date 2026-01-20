import axios from 'axios';

export const musicGenAxios = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Modal-key': process.env.MODAL_PROXY_KEY,
    'Modal-secret': process.env.MODAL_PROXY_SECRET,
  },
});
