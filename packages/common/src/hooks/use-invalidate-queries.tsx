import { QueryKey, useQueryClient } from '@tanstack/react-query';

export default function useInvalidateQueries() {
    const queryClient = useQueryClient();

    const invalidateQueries = async (queryKeys: QueryKey[]) => {
        await Promise.all(queryKeys.map(queryKey => queryClient.invalidateQueries({ queryKey })));
    };

    return invalidateQueries;
}
