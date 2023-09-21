
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col justify-center items-center w-full min-h-[80vh] px-4 sm:px-20 lg:px-60 xl:px-96">
      <div className="flex flex-col justify-center items-center w-full min-h-[40vh] mt-10 px-8 py-4 border-[1px] border-darkgrey gap-8 shadow-md">
        { children }
      </div>
    </div>
  )
}