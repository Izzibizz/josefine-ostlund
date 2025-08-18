
import { useEffect } from "react"
import { useUserStore } from "../stores/UserStore"

export const About:React.FC = () => {

  const { about , fetchAbout} = useUserStore()

useEffect(() => {
  const fetchData = async () => {
    await fetchAbout();
  };
  fetchData();
}, []);

  console.log(about)

  return (
    <section className="w-11/12 laptop:w-10/12 mx-auto pt-24 laptop:pt-40 gap-10 bg-white flex flex-col min-h-screen">
      <h2  className="font-header uppercase text-lg">Biografi</h2>
      <div className="font-body flex flex-col gap-6 text-justify">
     <p>{about.bio_1}</p>
     <p>{about.bio_2}</p>
     </div>
    </section>
  )
}


