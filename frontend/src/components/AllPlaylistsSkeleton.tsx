import { Skeleton } from "@/components/ui/skeleton"

export default function AllPlaylistsSkeleton() {
  return (
    <div>
      {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className='w-140 my-8'>
            <div className='flex items-center'>
              <Skeleton className="size-30 object-cover rounded ml-6"/>
              <div className="flex flex-col flex-grow">
                <Skeleton className="ml-5 h-8 w-[240px]"/>
              </div>
                <Skeleton className="mt-2 mr-6 size-6"/>
            </div> 
          </div>
      ))}
    </div>
  )
}