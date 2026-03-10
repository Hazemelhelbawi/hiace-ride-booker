import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera } from "lucide-react";

import van1 from "@/assets/gallery/1.jpeg";
import van2 from "@/assets/gallery/2.jpeg";
import van3 from "@/assets/gallery/3.jpeg";
import van4 from "@/assets/gallery/4.jpeg";
import van5 from "@/assets/gallery/5.jpeg";
import van6 from "@/assets/gallery/6.jpeg";
import van7 from "@/assets/gallery/7.jpeg";
import van8 from "@/assets/gallery/8.jpeg";
import van9 from "@/assets/gallery/9.jpeg";
import van10 from "@/assets/gallery/10.jpeg";
import van11 from "@/assets/gallery/11.jpeg";
import van12 from "@/assets/gallery/12.jpeg";
// import van1 from "@/assets/gallery/1.jpeg";
// import van1 from "@/assets/gallery/van-1.jpg";
// import van2 from "@/assets/gallery/van-2.jpg";
// import van3 from "@/assets/gallery/van-3.jpg";
// import van4 from "@/assets/gallery/van-4.jpg";
// import van5 from "@/assets/gallery/van-5.jpg";
// import van6 from "@/assets/gallery/van-6.jpg";
// import van7 from "@/assets/gallery/van-7.jpg";
// import van8 from "@/assets/gallery/van-8.jpg";

const images = [
  { src: van1, alt: "سيارتنا" },
  { src: van2, alt: "سيارتنا" },
  { src: van3, alt: "سيارتنا" },
  { src: van4, alt: "سيارتنا" },
  { src: van5, alt: "سيارتنا" },
  { src: van6, alt: "سيارتنا" },
  { src: van7, alt: "سيارتنا" },
  { src: van8, alt: "سيارتنا" },
  { src: van9, alt: "سيارتنا" },
  { src: van10, alt: "سيارتنا" },
  { src: van11, alt: "سيارتنا" },
  { src: van12, alt: "سيارتنا" },
];

const Gallery: React.FC = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4 font-medium">
            <Camera className="w-4 h-4" />
            {t("gallery.badge") || "Our Fleet"}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("gallery.title") || "Travel in Comfort & Style"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("gallery.subtitle") ||
              "Take a look at our modern fleet ready to take you anywhere"}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(img.src)}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
                i === 0 || i === 5 ? "row-span-2" : ""
              }`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover aspect-square transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all duration-300 flex items-end">
                <span className="text-white font-medium text-sm p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {img.alt}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-3xl p-1 bg-card border-0">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Gallery preview"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Gallery;
