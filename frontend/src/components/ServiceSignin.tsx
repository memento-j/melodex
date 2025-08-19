import { Button } from "./ui/button";

interface ServiceSigninProps {
    message: string;
    purpose: string;
  }

export default function ServiceSignin( { message, purpose }: ServiceSigninProps ) {
    return(
        <div className='flex flex-col items-center mt-70'>
          <p className='text-muted-foreground text-4xl p-5 mb-10'>{message}</p>
          <Button variant="outline" className='text-muted-foreground text-xl m-2 p-8' size="lg"  
            onClick={() => window.location.href = `http://127.0.0.1:8080/youtube/login?purpose=${purpose}`}>
              <img className='w-40 h-auto' src='/YouTube-White-Full-Color-Logo.wine.svg'/>
          </Button>
          <Button variant="outline" className='text-muted-foreground text-xl m-2 p-8' size="lg"  
            onClick={() => window.location.href = `http://127.0.0.1:8080/spotify/login?purpose=${purpose}`}> 
              <img className="w-40 h-auto" src='/Spotify-Logo.wine.svg'/>
          </Button>
        </div>
    );   
}