import { useMutation, useQueryClient } from "@tanstack/react-query";
import  toast  from "react-hot-toast"; // Ensure toast is imported

const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate: follow, isPending } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`/api/users/follow/${userId}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error.message); // Correct error handling
      }
    },
    onSuccess: async () => {
      try {
        // Awaiting invalidation ensures they are complete before continuing
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
          queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        ]);
      } catch (invalidateError) {
        console.error("Error invalidating queries: ", invalidateError);
      }
    },
    onError: (error) => {
      toast.error(error.message); // Show toast notification on error
    },
  });

  return { follow, isPending };
};

export default useFollow;
