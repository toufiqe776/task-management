import { useQuery } from '@tanstack/react-query';
import api from '../api/axios.js';

const useTasks = (filters = {}, page = 1) =>
  useQuery({
    queryKey: ['tasks', { ...filters, page }],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries({ ...filters, page }).filter(([, value]) => value !== '' && value !== undefined && value !== null)
      );

      const { data } = await api.get('/tasks', { params });
      return data;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
  });

export default useTasks;
