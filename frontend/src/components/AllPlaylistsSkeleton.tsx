import { Skeleton } from "@/components/ui/skeleton"

export default function AllPlaylistsSkeleton() {
  return (
    <div>
      {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className='w-110 sm:w-140 md:w-160 my-8'>
            <div className='flex items-center'>
              <Skeleton className="size-30 object-cover rounded ml-8 sm:ml-6"/>
              <div className="flex flex-col flex-grow gap-5">
                <Skeleton className="ml-8 h-8 w-40 sm:w-70 md:w-100"/>
              </div>
                <Skeleton className="mt-2 mr-11 md:mr-5 size-6"/>
            </div> 
          </div>
      ))}
    </div>
  )
}