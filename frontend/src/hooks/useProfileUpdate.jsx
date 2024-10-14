import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const useProfileUpdate = () => {
    const queryClient = useQueryClient()
    const {mutateAsync: updateProfile, isPending:isUpdatingProfile} = useMutation({
		mutationFn: async(formData)=>{
			try {
				const res = await fetch("/api/users/update", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(formData)
				})
				const data = await res.json()
				if(!res.ok){
					throw new Error(data.error || "something went wrong")
				}
			} catch (error) {
				throw new Error(error.message)
			}
		},
		onSuccess: async ()=>{
			toast.success('profile updated successfully')
			Promise.all([
				queryClient.invalidateQueries({queryKey: ['userProfile']}),
				queryClient.invalidateQueries({queryKey: ['authUser']})
			])
		},
		onError: async (error)=>{
			toast.error(error.message)
		}
	})
  return {updateProfile, isUpdatingProfile}
    
}

export default useProfileUpdate