"use client"

import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const Syllabus = () => {
  const router = useRouter()
  const years = [
    {
      title: 1,
      description: "View all subjects for year 1."
    },
    {
      title: 2,
      description: "View all subjects for year 2."
    },
    {
      title: 3,
      description: "View all subjects for year 3."
    }
  ]

  return (
    <main className='p-6 sm:w-[90vw] md:w-[80vw] lg:min-w-[80vw] mx-auto'>
      <div className='sticky top-0 z-50 bg-white p-4'>
        <div className='flex flex-row justify-between items-center'>
          <p className='font-bold text-3xl text-gray-800'>Syllabus</p>
        </div>
      </div>
      
      <section className='w-full border'>
        <div className='flex flex-row justify-between border-b p-2 bg-gray-100 font-semibold'>
          <div className='px-4'>Year</div>
          <div></div>
        </div>
        
        {years.map((year) => (
          <div key={year.title} className='flex flex-row justify-between items-center border-b px-8 py-4 hover:bg-gray-50'>
            <div className='text-lg font-medium text-gray-700'>{year.title}</div>
            <div>
              <Button 
                
                className="bg-gradient-to-b from-gray-600 to-gray-900 text-white hover:scale-105 transition-all duration-300"
                onClick={() => router.push(`syllabus/subject/${year.title}`)}
              >
                View <ChevronRight />
              </Button>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}

export default Syllabus;
