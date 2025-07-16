import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from "swiper/modules";

interface Image {
  url: string;
  public_id: string;
  photographer?: string;
}

interface Project  {
 _id: string;
  name: string;
  year: number;
  material: string;
  exhibited_at: string;
  category: string;
  description: string;
  images: Image[];
  video?: Image;
}

interface ProjectProps {
  project: Project;
  handlePreviewClick: (image: Image) => void;
}

export const SwiperComp:React.FC<ProjectProps> = ({project, handlePreviewClick}) => {
  return (
     <Swiper
                  key={project?.name}
                  slidesPerView={3}
                  spaceBetween={20}
                  speed={1200}
                  loop
                  zoom
                  updateOnWindowResize
                  scrollbar={{ draggable: true }}
                  autoplay={{
                    pauseOnMouseEnter: true,
                    disableOnInteraction: false,
                  }}
                  breakpoints={{
                    320: {
                      spaceBetween: 10,
                    },
                    768: {
                      spaceBetween: 15,
                    },
                    1024: {
                      spaceBetween: 20,
                    },
                    1280: {
                      spaceBetween: 25,
                    },
                  }}
                  effect="fade"
                  modules={[Autoplay]}
                  className="w-full my-4 h-auto"
                >
                  {project?.images.map((file, index) => (
                    <SwiperSlide key={index}>
                      <div className="relative group">
                        <img
                          src={file.url}
                          alt={file.photographer}
                          className="w-full h-full  object-cover cursor-hollow"
                        />
                        <div
                          className="absolute max-w-full max-h-full inset-0 bg-black opacity-40 group-hover:opacity-0 transition-opacity duration-500 ease-in-out"
                          onClick={() => handlePreviewClick(file)}
                          onTouchStart={() =>
                            handlePreviewClick(file)
                          }
                        ></div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                
  )
}

