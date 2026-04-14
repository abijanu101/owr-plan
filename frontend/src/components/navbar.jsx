import icon from '/favicon.svg'
export default function Navbar() {
    return <>

        <div className="bg-accent text-primary p-10">
            <div className='flex flex-row gap-1'>
                <img src={icon} className='w-9 h-9' />
                <h1 className="text-2xl">OwrPlan</h1>
            </div>
        </div>

    </>
}