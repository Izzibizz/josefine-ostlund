import { useState, useEffect, useRef } from "react"

export const LandingPage: React.FC = () => {

    const videoRef = useRef<HTMLVideoElement>(null)
    const videoOptions = [
       "https://res.cloudinary.com/dctpyfz60/video/upload/v1752581841/grund-2023-josefine-ostlund-mobile_lrllyl.mp4", "https://res.cloudinary.com/dctpyfz60/video/upload/v1752573282/grund-2023-josefine-ostlund-mobile_rnd8cj.mp4", "https://res.cloudinary.com/dctpyfz60/video/upload/v1752575885/josefine-ostlund-grund-2023-wide_zko61q.mp4"
    ]
    const [ videoSrc, setVideoSrc ] = useState<string>(videoOptions[0])
    
    
    useEffect(() => {
    const handleResize = () => {
     const width = window.innerWidth;
     if (width < 768) {
      setVideoSrc(videoOptions[0])
     } else if ( width < 1025) {
      setVideoSrc(videoOptions[1])
     } else {
      setVideoSrc(videoOptions[2])
     }
    };

    handleResize()

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

   const timeout = setTimeout(() => {
      video.muted = true;
      video.playsInline = true;
      video.pause()
      video.load()

      video.play()
      .then(() => {
        console.log("video is playing")
      })
      .catch((err) => {
        console.warn("autoplay failed", err)
      })
   }, 300)

   return () => clearTimeout(timeout)
  }, [videoSrc])

  return (
  <section className="bg-black animate-fadeIn">
      <video
      ref={videoRef}
      key={videoSrc} 
        autoPlay
        preload="auto"
        loop
        muted
        playsInline
        style={{pointerEvents: "none", userSelect: "none"}}
        className="fixed top-1/2 left-1/2 w-screen h-screen object-cover transform -translate-x-1/2 -translate-y-1/2 animate-fadeIn"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
     <img src="/Josefine-ostlund-w-50.svg" alt="josefine östlund" className="absolute z-20 bottom-25 tablet:bottom-2 right-1 max-w-[98%] laptop:max-w-[40%] laptop:bottom-5 laptop:right-5"/>
    </section>
  )
}
