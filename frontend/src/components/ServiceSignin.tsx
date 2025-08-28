import { Button } from "./ui/button";

interface ServiceSigninProps {
    message: string;
    purpose: string;
  }

export default function ServiceSignin( { message, purpose }: ServiceSigninProps ) {
    return(
        <div className='flex flex-col items-center mt-40 sm:mt-60 dark'>
          <p className='text-white text-4xl p-5 mb-10 text-center'>{message}</p>
          <Button variant="default" className='bg-slate-900 border border-slate-500 hover:bg-indigo-500/80 hover:scale-105 transition-transform duration-50 m-2 p-8' size="lg"  
            onClick={() => window.location.href = `http://127.0.0.1:8080/youtube/login?purpose=${purpose}`}>
              <img className='w-45 h-auto' src='/YouTube-White-Full-Color-Logo.wine.svg'/>
          </Button>
          <Button variant="default" className='bg-slate-900 border border-slate-500 hover:bg-indigo-500/80 hover:scale-105 transition-transform duration-50 m-2 p-8' size="lg"  
            onClick={() => window.location.href = `http://127.0.0.1:8080/spotify/login?purpose=${purpose}`}> 
              <img className="w-45 h-auto" src='/Spotify-Logo.wine.svg'/>
          </Button>
        </div>
    );   
}