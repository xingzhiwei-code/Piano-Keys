import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertRecording } from "@shared/routes";
import { z } from "zod";

export function useRecordings() {
  return useQuery({
    queryKey: [api.recordings.list.path],
    queryFn: async () => {
      const res = await fetch(api.recordings.list.path);
      if (!res.ok) throw new Error("Failed to fetch recordings");
      // Use the Zod schema from routes to validate response
      return api.recordings.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateRecording() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertRecording) => {
      // Validate input before sending
      const validated = api.recordings.create.input.parse(data);
      
      const res = await fetch(api.recordings.create.path, {
        method: api.recordings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.recordings.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create recording");
      }
      
      return api.recordings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.recordings.list.path] });
    },
  });
}
